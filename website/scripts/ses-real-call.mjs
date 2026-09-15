/* Rule 23 real-call record for the SES transport: sends ONE SendEmail through server/mailer.mjs against the real
 * SES API (eu-central-1, the geomagics_production profile / EC2 role) and prints the exact outcome. While the
 * playmusicprompts.com identity is unverified this yields the documented failure class, which is the point of the
 * run: the code path, the SDK mapping and the honest error are proven against the live platform. Once the DKIM
 * records exist and the identity verifies, the same command records the success path (a MessageId).
 * Usage from the website directory (owner's AWS profile): $env:AWS_PROFILE='geomagics_production'; node scripts/ses-real-call.mjs <recipient>
 */
import {Mailer} from '../server/mailer.mjs';
const to = process.argv[2]; if (!to) { console.error('recipient required'); process.exit(2); }
const mailer = new Mailer({transport: 'ses', from: 'no-reply@playmusicprompts.com', region: process.env.AWS_REGION || 'eu-central-1', stateRoot: '.state'});
try { const r = await mailer.send({to, subject: 'PlayMusicPrompts SES transport check', text: 'Transport check.', html: '<p>Transport check.</p>'}); console.log(JSON.stringify({outcome: 'success', ...r})); }
catch (error) { console.log(JSON.stringify({outcome: 'failure', code: error.code, message: error.message, sesName: error.cause?.name, httpStatus: error.cause?.$metadata?.httpStatusCode})); }
