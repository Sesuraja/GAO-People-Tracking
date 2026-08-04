// Vercel serverless entry point.
//
// Vercel's rewrites (see vercel.json) send every request under /api/* here.
// We build the Express app once per warm container and reuse it across
// invocations - this is what lets the MongoDB client (and its retry timer)
// stay connected between requests instead of reconnecting from scratch on
// every single call, which would be slow and would hammer Atlas.
import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server';

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  // An Express app instance is itself a valid (req, res) request handler.
  (app as any)(req, res);
}
