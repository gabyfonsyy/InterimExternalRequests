// Forwards Jira Automation's webhook POST to the Apps Script "Anyone"-access deployment,
// following Apps Script's internal redirect server-side — Jira's automation engine can't
// follow redirects itself, which is why calling the Apps Script URL directly returns a 302.

module.exports = async (req, res) => {
  const APPS_SCRIPT_WEBHOOK_URL = process.env.APPS_SCRIPT_WEBHOOK_URL;

  if (!APPS_SCRIPT_WEBHOOK_URL) {
    res.status(500).json({ error: 'APPS_SCRIPT_WEBHOOK_URL environment variable is not set.' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    // Vercel's Node runtime parses a JSON request body into req.body automatically.
    const upstream = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach the request portal.' });
  }
};
