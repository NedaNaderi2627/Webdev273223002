import http from 'node:http';
import { recommendTimeSlots } from './src/services/recommendations.js';

const port = Number(process.env.PORT || 3000);

const htmlPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>University Lab Booking</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --accent: #1d4ed8;
      --radius: 10px;
      --space: 16px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: var(--space);
      line-height: 1.5;
    }
    main {
      max-width: 760px;
      margin: 0 auto;
      background: var(--surface);
      padding: calc(var(--space) * 1.5);
      border-radius: var(--radius);
      border: 1px solid #cbd5e1;
    }
    label, input, button {
      display: block;
      width: 100%;
      margin-top: 8px;
      font-size: 16px;
    }
    input, button {
      min-height: 44px;
      padding: 10px 12px;
      border-radius: var(--radius);
      border: 1px solid #94a3b8;
    }
    button {
      background: var(--accent);
      color: #ffffff;
      border: none;
      cursor: pointer;
      margin-top: 14px;
    }
    :focus-visible {
      outline: 3px solid #f59e0b;
      outline-offset: 2px;
    }
    #status {
      margin-top: 16px;
      padding: 12px;
      border-radius: var(--radius);
      background: #f1f5f9;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main>
    <h1>University Lab Booking</h1>
    <p>Check recommended lab time slots for a workstation and date.</p>
    <form id="slot-form">
      <label for="ws">Workstation ID</label>
      <input id="ws" name="ws" type="number" value="101" required />
      <label for="date">Date</label>
      <input id="date" name="date" type="date" value="2026-12-01" required />
      <button type="submit">Suggest Slot</button>
    </form>
    <div id="status" role="status" aria-live="polite">Ready. Enter a workstation ID and date.</div>
  </main>
  <script>
    const form = document.getElementById('slot-form');
    const statusEl = document.getElementById('status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = 'Thinking and loading slots...';
      try {
        const ws = Number(document.getElementById('ws').value);
        const date = document.getElementById('date').value;
        const res = await fetch('/api/recommendations?workstationId=' + encodeURIComponent(ws) + '&date=' + encodeURIComponent(date));
        if (!res.ok) {
          statusEl.textContent = 'Could not load recommendations right now. Please try again.';
          return;
        }
        const data = await res.json();
        if (!data.slots || data.slots.length === 0) {
          statusEl.textContent = 'No slots available for this selection. Try another date or workstation.';
          return;
        }
        const label = data.source === 'model' ? 'Model suggestion' : 'Fallback schedule (suggestion)';
        statusEl.textContent = label + ': ' + data.slots.map((s) => s.startTime + '-' + s.endTime).join(', ');
      } catch (_err) {
        statusEl.textContent = 'Network error while loading slot recommendations. Please check your connection.';
      }
    });
  </script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    try {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'ok', db: 'ok' }));
    } catch (_err) {
      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'error', db: 'down' }));
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/recommendations') {
    try {
      const workstationId = Number(url.searchParams.get('workstationId') || 101);
      const date = url.searchParams.get('date') || '2026-12-01';
      const result = await recommendTimeSlots({ userId: 1, workstationId, date });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Something went wrong on our side' }));
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlPage);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
