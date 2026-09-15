/* Mailer — transactional account e-mail for the PlayMusicPrompts website (Amazon SES API v2, or a private
 * on-disk outbox during local development).
 *
 * WHAT IT DOES
 *   `send({to, subject, text, html})` delivers ONE message to ONE recipient and resolves `{transport, id}` on
 *   real success, or throws a `MailError` whose `code` names the honest failure class. It never claims a send
 *   that did not happen: the SES transport resolves only when SES returned a MessageId; the file transport
 *   resolves only after the message file is written and fsync'd.
 *
 * TRANSPORTS (chosen by config, never by guessing)
 *   ses  — Amazon SES API v2 `SendEmail` (docs/external-api/aws-sesv2/API_SendEmail.html, "Request Syntax"):
 *          FromEmailAddress (must be a VERIFIED identity), Destination.ToAddresses[], Content.Simple.{Subject,
 *          Body.Text, Body.Html}, optional ReplyToAddresses[] and ConfigurationSetName. Credentials come from the
 *          AWS default chain (EC2 role in production, the developer's profile locally); region from AWS_REGION.
 *          The SDK exceptions the page enumerates (MailFromDomainNotVerifiedException, MessageRejected,
 *          SendingPausedException, AccountSuspendedException, TooManyRequestsException, LimitExceededException,
 *          BadRequestException, NotFoundException) are mapped to MailError codes and surfaced, never swallowed.
 *   file — writes each message as one JSON file under <stateRoot>/outbox/ (private directory, outside public/),
 *          so a developer can open the verification / reset link that a real mail would carry. This is a real
 *          transport with a real destination (the owner's disk), clearly named in every log line; it is refused
 *          in production (config.mjs).
 *
 * Callers: server/accounts.mjs. Constants: server/account-constants.mjs. Wiring: server/main.mjs via config.mjs.
 */
import {mkdirSync, openSync, writeSync, fsyncSync, closeSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {MAIL_OUTBOX_DIRECTORY, MAIL_TRANSPORT_FILE, MAIL_TRANSPORT_SES} from './account-constants.mjs';

export class MailError extends Error {
  constructor(code, message, cause) { super(message); this.code = code; this.cause = cause; }
}

/** Maps an SES v2 SDK exception name (API_SendEmail.html "Errors") to a stable website failure code. */
const SES_ERROR_CODES = Object.freeze({
  MailFromDomainNotVerifiedException: 'MAIL_SENDER_UNVERIFIED',
  MessageRejected: 'MAIL_REJECTED',
  SendingPausedException: 'MAIL_SENDING_PAUSED',
  AccountSuspendedException: 'MAIL_ACCOUNT_SUSPENDED',
  TooManyRequestsException: 'MAIL_THROTTLED',
  LimitExceededException: 'MAIL_LIMIT',
  BadRequestException: 'MAIL_BAD_REQUEST',
  NotFoundException: 'MAIL_NOT_FOUND',
});

class SesTransport {
  constructor({from, replyTo, configurationSet, region}) {
    this.name = MAIL_TRANSPORT_SES; this.from = from; this.replyTo = replyTo; this.configurationSet = configurationSet; this.region = region; this.client = null;
  }
  async client_() {
    if (!this.client) {
      const {SESv2Client} = await import('@aws-sdk/client-sesv2');
      this.client = new SESv2Client(this.region ? {region: this.region} : {});
    }
    return this.client;
  }
  async send({to, subject, text, html}) {
    const {SendEmailCommand} = await import('@aws-sdk/client-sesv2');
    const input = {
      FromEmailAddress: this.from,
      Destination: {ToAddresses: [to]},
      Content: {Simple: {Subject: {Data: subject, Charset: 'UTF-8'}, Body: {Text: {Data: text, Charset: 'UTF-8'}, Html: {Data: html, Charset: 'UTF-8'}}}},
    };
    if (this.replyTo) input.ReplyToAddresses = [this.replyTo];
    if (this.configurationSet) input.ConfigurationSetName = this.configurationSet;
    try {
      const result = await (await this.client_()).send(new SendEmailCommand(input));
      if (!result?.MessageId) throw new MailError('MAIL_NO_MESSAGE_ID', 'SES accepted the request without a MessageId.');
      return {transport: this.name, id: result.MessageId};
    } catch (error) {
      if (error instanceof MailError) throw error;
      const code = SES_ERROR_CODES[error?.name] || 'MAIL_TRANSPORT_FAILED';
      throw new MailError(code, `SES ${error?.name || 'error'}: ${error?.message || 'send failed'}`, error);
    }
  }
}

class FileTransport {
  constructor({directory, from}) { this.name = MAIL_TRANSPORT_FILE; this.directory = directory; this.from = from; mkdirSync(directory, {recursive: true, mode: 0o700}); }
  async send({to, subject, text, html}) {
    const id = randomUUID();
    const record = {id, at: new Date().toISOString(), from: this.from, to, subject, text, html};
    const path = join(this.directory, `${record.at.replace(/[:.]/g, '-')}-${id}.json`);
    const fd = openSync(path, 'wx', 0o600);
    try { writeSync(fd, JSON.stringify(record, null, 2)); fsyncSync(fd); } finally { closeSync(fd); }
    return {transport: this.name, id, path};
  }
}

export class Mailer {
  /**
   * @param {{transport: 'ses'|'file', from: string, replyTo?: string, configurationSet?: string, region?: string, stateRoot?: string}} options
   */
  constructor(options) {
    if (options.transport === MAIL_TRANSPORT_SES) this.transport = new SesTransport(options);
    else if (options.transport === MAIL_TRANSPORT_FILE) this.transport = new FileTransport({directory: resolve(options.stateRoot, MAIL_OUTBOX_DIRECTORY), from: options.from});
    else throw new TypeError(`Unknown mail transport: ${options.transport}`);
    this.from = options.from;
  }
  get transportName() { return this.transport.name; }
  /** @returns {Promise<{transport: string, id: string, path?: string}>} */
  send(message) {
    for (const field of ['to', 'subject', 'text', 'html']) if (typeof message?.[field] !== 'string' || !message[field]) throw new MailError('MAIL_BAD_REQUEST', `Mail message is missing ${field}.`);
    return this.transport.send(message);
  }
}
