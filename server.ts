import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy the GAO APIs
  const GAO_API_HOST = 'https://www.i360services.com/peopletrackinguhf';

  app.get('/api/GetHistoryTotalCount', async (req, res) => {
    try {
      const gaoRes = await fetch(`${GAO_API_HOST}/api/GetHistoryTotalCount`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await gaoRes.text();
      res.send(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/GetHistoryRecords/:skip/:take', async (req, res) => {
    try {
      const { skip, take } = req.params;
      const gaoRes = await fetch(`${GAO_API_HOST}/api/GetHistoryRecords/${skip}/${take}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await gaoRes.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/GetTagsInRealtime', async (req, res) => {
    try {
      const gaoRes = await fetch(`${GAO_API_HOST}/api/GetTagsInRealtime`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await gaoRes.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
