// Serves the Google Apps Script web app under this Vercel domain.
// It only needs to handle the page load — form submissions (google.script.run)
// and the Jira webhook talk to Google's servers directly, bypassing this proxy entirely.

export default async function handler(req, res) {
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  if (!APPS_SCRIPT_URL) {
    res.status(500).send('APPS_SCRIPT_URL environment variable is not set in Vercel project settings.');
    return;
  }

  try {
    // redirect: 'follow' resolves Apps Script's /exec -> googleusercontent.com hop
    // server-side, so the visitor's address bar stays on this domain.
    const upstream = await fetch(APPS_SCRIPT_URL, { redirect: 'follow' });
    const body = await upstream.text();

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/html; charset=utf-8');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).send('Could not reach the request portal right now. Please try again shortly.');
  }
}
