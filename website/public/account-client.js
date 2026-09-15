/* account-client.js — browser side of e-mail + password accounts (login.html and account.html).
 *
 * Loaded on every non-room page by app-entry.js; does nothing unless the page carries `#auth-form` (login.html)
 * or `#account-panel` (account.html). Talks ONLY to the website's own /api/account/* routes through APP.request
 * (same-origin cookie session + CSRF header); no third-party script, no credential ever leaves this origin.
 *
 * login.html modes on ONE form (data-mode on the form): sign-in | sign-up | reset. "Create an account" and
 * "Forgot password?" switch the mode; fields not needed by a mode are hidden and disabled so they are never sent.
 * The password field shows a live LENGTH meter (NIST SP 800-63B-4: length is the requirement, 15+ code points;
 * no composition rules are suggested anywhere). Server verdicts are shown verbatim in #auth-status.
 *
 * account.html: consumes ?verify=<token> and ?reset=<token> links from the e-mails, and — when signed in —
 * shows the account panel (e-mail, verified state, resend confirmation, change password, delete account).
 * Every message shown is the server's own wording; nothing is claimed that the server did not confirm.
 */
(() => {
  'use strict';
  const APP = window.PMP_APP; if (!APP) return;
  const $ = s => document.querySelector(s);
  const MIN = 15; // mirrors PASSWORD_MIN_LENGTH in server/account-constants.mjs; the server is the authority
  const codePoints = text => Array.from(text || '').length;
  const status = (el, text, error = false) => { if (!el) return; el.hidden = !text; el.textContent = text || ''; el.classList.toggle('error', !!error); };
  const afterSignIn = target => { location.assign(target || 'library.html'); };

  function meter(input, out) {
    if (!input || !out) return;
    const render = () => { const n = codePoints(input.value); out.textContent = n === 0 ? `At least ${MIN} characters. A phrase you will remember works best.` : n < MIN ? `${n} of ${MIN} characters — keep going.` : `${n} characters — long enough.`; out.dataset.state = n === 0 ? 'empty' : n < MIN ? 'short' : 'ok'; };
    input.addEventListener('input', render); render();
  }

  function initLogin(form) {
    const emailField = form.querySelector('[name=email]'), nameField = form.querySelector('[name=name]'), passwordField = form.querySelector('[name=password]');
    const nameWrap = form.querySelector('[data-field=name]'), passwordWrap = form.querySelector('[data-field=password]'), meterOut = form.querySelector('#password-meter');
    const submit = form.querySelector('.auth-submit'), statusEl = $('#auth-status'), title = $('#auth-title'), intro = $('#auth-intro'), signupLink = $('#signup-switch'), recovery = form.querySelector('.recovery');
    const google = $('[data-action=provider][data-provider=google]');
    if (google) { const available = !!APP.config.identity?.oidc; google.disabled = !available; google.title = available ? '' : 'Google sign-in is not connected yet.'; if (!available) google.classList.add('is-unavailable'); }
    // Reset-by-e-mail exists only when the server has a mail transport (identity.mail from /api/session). Without one
    // the link is removed and replaced by a plain note — never a button that would end in "we sent a link".
    const mailAvailable = !!APP.config.identity?.mail;
    if (recovery && !mailAvailable) {
      const note = document.createElement('p'); note.className = 'recovery-note'; note.textContent = 'Password reset by e-mail opens once e-mail is connected. Signed-in members can change their password from the account page.';
      recovery.replaceWith(note);
    }
    const recoveryEl = mailAvailable ? recovery : null;
    meter(passwordField, meterOut);
    const setMode = mode => {
      form.dataset.mode = mode;
      const copy = {
        'sign-in': ['Welcome back.', 'Sign in to save and revisit your music.', 'Sign in', 'New here?', 'Create an account'],
        'sign-up': ['Make it yours.', 'Create an account to save songs and build playlists. Listening and creating stay free without one.', 'Create account', 'Already have an account?', 'Sign in'],
        'reset': ['Forgot your password?', 'Enter your e-mail and we will send a link to choose a new one.', 'Send reset link', 'Remembered it?', 'Sign in'],
      }[mode];
      if (title) title.textContent = copy[0]; if (intro) intro.textContent = copy[1]; if (submit) submit.textContent = copy[2];
      if (signupLink) { signupLink.previousSibling && (signupLink.parentNode.firstChild.textContent = copy[3] + ' '); signupLink.textContent = copy[4]; signupLink.dataset.target = mode === 'sign-in' ? 'sign-up' : 'sign-in'; }
      const showName = mode === 'sign-up', showPassword = mode !== 'reset';
      if (nameWrap) { nameWrap.hidden = !showName; nameField.disabled = !showName; nameField.required = showName; }
      if (passwordWrap) { passwordWrap.hidden = !showPassword; passwordField.disabled = !showPassword; passwordField.required = showPassword; passwordField.autocomplete = mode === 'sign-up' ? 'new-password' : 'current-password'; }
      if (meterOut) meterOut.hidden = mode !== 'sign-up';
      if (recoveryEl) recoveryEl.hidden = mode !== 'sign-in';
      status(statusEl, '');
    };
    window.PMP.actions['sign-up'] = b => setMode(b?.dataset?.target || (form.dataset.mode === 'sign-up' ? 'sign-in' : 'sign-up'));
    window.PMP.actions['reset-password'] = () => { if (!mailAvailable) { APP.notify('Password reset by e-mail is not available yet.'); return; } setMode('reset'); };
    window.PMP.actions.provider = async () => { if (!APP.config.identity?.oidc) { APP.notify('Google sign-in is not connected yet. Create an account with your e-mail instead.'); return; } await APP.signIn(); };
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (form.dataset.busy) return; form.dataset.busy = '1'; submit.disabled = true; status(statusEl, 'Working…');
      try {
        const mode = form.dataset.mode, email = emailField.value;
        if (mode === 'reset') { await APP.request('/api/account/request-reset', {method: 'POST', body: {email}}); status(statusEl, 'If an account exists for that e-mail, a reset link is on its way. It works for one hour.'); return; }
        if (mode === 'sign-up') {
          const r = await APP.request('/api/account/register', {method: 'POST', body: {email, name: nameField.value, password: passwordField.value}});
          APP.csrf = r.csrf; APP.user = r.user;
          status(statusEl, !r.emailVerificationRequired ? 'Account created — you are signed in.' : r.mail?.sent ? 'Account created. We sent a confirmation link to your e-mail — you are already signed in.' : 'Account created and signed in. The confirmation e-mail could not be sent right now; you can resend it from your account page.');
          setTimeout(() => afterSignIn('account.html'), 1400); return;
        }
        const r = await APP.request('/api/account/sign-in', {method: 'POST', body: {email, password: passwordField.value}});
        APP.csrf = r.csrf; APP.user = r.user; afterSignIn(new URLSearchParams(location.search).get('next') === 'account' ? 'account.html' : 'library.html');
      } catch (error) { status(statusEl, error.message, true); }
      finally { delete form.dataset.busy; submit.disabled = false; }
    });
    setMode(new URLSearchParams(location.search).get('mode') === 'sign-up' ? 'sign-up' : 'sign-in');
  }

  async function initAccount(panel) {
    const params = new URLSearchParams(location.search), statusEl = $('#account-status');
    const verify = params.get('verify'), reset = params.get('reset');
    const linkOk = t => /^[A-Za-z0-9_-]{43}$/.test(t || '');
    if (verify) {
      history.replaceState(null, '', 'account.html');
      if (!linkOk(verify)) status(statusEl, 'This link is not valid any more. Request a new one.', true);
      else try { await APP.request('/api/account/verify-email', {method: 'POST', body: {token: verify}}); status(statusEl, 'Your e-mail address is confirmed. Thank you.'); } catch (error) { status(statusEl, error.message, true); }
    }
    const resetForm = $('#reset-form');
    if (reset && resetForm) {
      history.replaceState(null, '', 'account.html');
      resetForm.hidden = false; meter(resetForm.querySelector('[name=password]'), resetForm.querySelector('#reset-meter'));
      resetForm.addEventListener('submit', async event => {
        event.preventDefault(); const out = $('#reset-status');
        try { await APP.request('/api/account/reset', {method: 'POST', body: {token: reset, password: resetForm.querySelector('[name=password]').value}}); status(out, 'Your password is changed and every other device was signed out. Sign in with the new password.'); resetForm.querySelector('button[type=submit]').disabled = true; setTimeout(() => location.assign('login.html'), 1800); }
        catch (error) { status(out, error.message, true); }
      });
      if (!linkOk(reset)) status($('#reset-status'), 'This link is not valid any more. Request a new one.', true);
    }
    const signedIn = !!APP.user;
    const manage = $('#account-manage'), signInPrompt = $('#account-signin-prompt');
    if (manage) manage.hidden = !signedIn; if (signInPrompt) signInPrompt.hidden = signedIn || !!reset;
    if (!signedIn) return;
    try {
      const me = await APP.request('/api/account');
      $('#account-name').textContent = me.user?.name || ''; $('#account-email').textContent = me.email || '(signed in through an external provider)';
      const verified = $('#account-verified');
      verified.textContent = !me.passwordAccount ? 'External sign-in' : me.emailVerified ? 'E-mail confirmed' : me.emailVerificationRequired ? 'E-mail not confirmed yet' : 'Active — e-mail confirmation is not required for now';
      $('#resend-verification').hidden = !(me.passwordAccount && me.emailVerificationRequired && !me.emailVerified);
      $('#change-password-form').hidden = !me.passwordAccount; $('#delete-form').hidden = !me.passwordAccount;
    } catch (error) { status(statusEl, error.message, true); }
    $('#resend-verification')?.addEventListener('click', async b => { b.disabled = true; try { const r = await APP.request('/api/account/resend-verification', {method: 'POST', body: {}}); status(statusEl, r.sent ? 'Confirmation e-mail sent again.' : r.reason === 'ALREADY_VERIFIED' ? 'Your e-mail is already confirmed.' : 'The confirmation e-mail could not be sent right now.'); } catch (error) { status(statusEl, error.message, true); } finally { b.disabled = false; } });
    const change = $('#change-password-form'); if (change) { meter(change.querySelector('[name=password]'), change.querySelector('#change-meter')); change.addEventListener('submit', async event => { event.preventDefault(); const out = $('#change-status'); try { const r = await APP.request('/api/account/change-password', {method: 'POST', body: {currentPassword: change.querySelector('[name=currentPassword]').value, password: change.querySelector('[name=password]').value}}); APP.csrf = r.csrf; change.reset(); status(out, 'Password changed. Every other device was signed out.'); } catch (error) { status(out, error.message, true); } }); }
    const del = $('#delete-form'); if (del) del.addEventListener('submit', async event => { event.preventDefault(); const out = $('#delete-status'); if (!confirm('Delete your account and its saved collections? This cannot be undone.')) return; try { const r = await APP.request('/api/account/delete', {method: 'POST', body: {password: del.querySelector('[name=password]').value}}); APP.user = null; status(out, r.message); setTimeout(() => location.assign('index.html'), 1500); } catch (error) { status(out, error.message, true); } });
  }

  const form = $('#auth-form'); if (form) initLogin(form);
  const panel = $('#account-panel'); if (panel) initAccount(panel);
})();
