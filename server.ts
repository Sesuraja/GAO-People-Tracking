import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // AI Activity Analysis endpoint
  app.post('/api/analyze-activity', async (req, res) => {
    try {
      const { tags } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze these RFID tracking tags to infer staff activity and dwell time. Tags: ${JSON.stringify(tags)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    TagID: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });
      res.json(JSON.parse(response.text!));
    } catch (e: any) {
      console.error('AI Analysis Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // AI Chat endpoint
  app.post('/api/staff-chat', async (req, res) => {
    try {
      const { message, staffData } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the GAO Core Engine Chatbot. You provide technical, operational insights based on the provided staff tracking and device data. Be concise, professional, and act as a systems administrator tool. \n\nData: ${JSON.stringify(staffData)}\n\nQuestion: ${message}`,
      });
      res.json({ response: response.text });
    } catch (e: any) {
      console.error('AI Chat Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

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
