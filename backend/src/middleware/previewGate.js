/**
 * Preview access gate (staging protection).
 *
 * Active only when the PREVIEW_PASSWORD environment variable is set.
 * When active:
 *   - Adds X-Robots-Tag: noindex, nofollow to every response.
 *   - Requires an HttpOnly cookie for ALL traffic (API + pages).
 *   - POST /api/preview-auth { "password": "..." } sets the cookie.
 *   - GET /api/health stays open so uptime checks work.
 * When PREVIEW_PASSWORD is not set, this middleware does nothing.
 */

const crypto = require('crypto');

const COOKIE_NAME = 'alaa_preview';
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function expectedToken() {
  return crypto
    .createHash('sha256')
    .update(process.env.PREVIEW_PASSWORD + '|alaa-preview-gate-v1')
    .digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
    }
  });
  return out;
}

const GATE_PAGE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>معاينة خاصة - Private Preview</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #1e293b; padding: 2rem; border-radius: 1rem; width: 90%%; max-width: 360px;
          box-shadow: 0 10px 30px rgba(0,0,0,.4); text-align: center; }
  h1 { font-size: 1.25rem; margin: 0 0 .25rem; }
  p { color: #94a3b8; font-size: .9rem; margin: 0 0 1.25rem; }
  input { width: 100%%; padding: .75rem; border-radius: .5rem; border: 1px solid #334155;
          background: #0f172a; color: #e2e8f0; font-size: 1rem; box-sizing: border-box; }
  button { width: 100%%; margin-top: .75rem; padding: .75rem; border: 0; border-radius: .5rem;
           background: #3b82f6; color: #fff; font-size: 1rem; cursor: pointer; }
  button:hover { background: #2563eb; }
  .err { color: #f87171; font-size: .85rem; min-height: 1.2em; margin-top: .5rem; }
</style>
</head>
<body>
  <form class="card" id="f">
    <h1>معاينة خاصة</h1>
    <p>Private preview - enter the access password<br>أدخلي كلمة سر المعاينة</p>
    <input type="password" id="pw" autocomplete="current-password" placeholder="Password / كلمة السر" required>
    <button type="submit">دخول - Enter</button>
    <div class="err" id="err"></div>
  </form>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = document.getElementById('err');
  err.textContent = '';
  try {
    const r = await fetch('/api/preview-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: document.getElementById('pw').value })
    });
    if (r.ok) { location.reload(); return; }
    err.textContent = 'كلمة السر غير صحيحة - Wrong password';
  } catch (_) {
    err.textContent = 'خطأ في الاتصال - Connection error';
  }
});
</script>
</body>
</html>`;

module.exports = function previewGate(req, res, next) {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return next(); // gate disabled: normal production behavior

  res.set('X-Robots-Tag', 'noindex, nofollow');

  // Password check endpoint
  if (req.path === '/api/preview-auth' && req.method === 'POST') {
    const supplied = (req.body && typeof req.body.password === 'string') ? req.body.password : '';
    const suppliedHash = crypto.createHash('sha256').update(supplied).digest('hex');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (supplied.length > 0 && safeEqual(suppliedHash, passwordHash)) {
      res.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${expectedToken()}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}`
      );
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Wrong password' });
  }

  // Health check stays reachable for platform monitoring
  if (req.path === '/api/health') return next();

  // Valid cookie?
  const cookies = parseCookies(req);
  if (cookies[COOKIE_NAME] && safeEqual(cookies[COOKIE_NAME], expectedToken())) {
    return next();
  }

  // Rejected
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Preview access required' });
  }
  return res.status(401).type('html').send(GATE_PAGE);
};
