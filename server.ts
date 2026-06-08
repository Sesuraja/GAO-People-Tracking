import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import admin from 'firebase-admin';
import fs from 'fs';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  console.error('Failed to read firebase-applet-config.json in backend:', err);
}

let adminApp: admin.app.App | null = null;
let dbAdmin: admin.firestore.Firestore | null = null;

try {
  if (firebaseConfig.projectId) {
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    dbAdmin = admin.firestore();
    if (firebaseConfig.firestoreDatabaseId) {
      dbAdmin.settings({
        databaseId: firebaseConfig.firestoreDatabaseId,
        ignoreUndefinedProperties: true
      });
    }
    console.log('Firebase Admin initialized successfully in server.');
  }
} catch (err: any) {
  console.error('Firebase Admin initialization error, continuing with in-memory fallback:', err);
}

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

  // Comprehensive AI RFID Analysis and Quality Improvement Endpoint
  app.post('/api/analyze-rfid-results', async (req, res) => {
    try {
      const { liveTags, historyRecords } = req.body;
      
      const promptText = `
        You are an expert UHF RFID Systems Analytics AI. Analyze the following real-time and historical personnel scans from our GAO RFID Readers to deliver operational observations, security risk intelligence, and facility flow recommendations ("improved output").

        --- LIVE SCANS ---
        ${JSON.stringify(liveTags || [])}

        --- HISTORY ARCHIVE LOGS ---
        ${JSON.stringify(historyRecords || [])}

        --- ANALYTICAL CRITERIA ---
        1. Look for unexpected dwell times, loitering, or out-of-bounds occurrences (e.g. unescorted visitors entering the Server Room or Engineering Lab).
        2. Identify bottlenecks or flow issues (e.g. dense scans at Entrance but empty office desks).
        3. Formulate actionable layout or hardware optimization recommendations (e.g., repositioning reader devices, adding verification gates, or adjusting shift schedule bounds).
        4. Detail personnel efficiency based on zone transitions.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              anomalies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tagId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    zone: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["tagId", "severity", "title", "description"]
                }
              },
              optimizations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    title: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                    description: { type: Type.STRING },
                    actionableSteps: { type: Type.STRING }
                  },
                  required: ["category", "title", "impact", "description"]
                }
              },
              personnelEfficiency: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tagId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    inferredActivity: { type: Type.STRING },
                    efficiencyScore: { type: Type.INTEGER }, // scale 1-100
                    dwellTimeInfo: { type: Type.STRING }
                  },
                  required: ["tagId", "inferredActivity", "efficiencyScore"]
                }
              }
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || '{}');
      res.json(parsedData);
    } catch (e: any) {
      console.error('RFID Intelligent Analysis failed:', e);
      res.status(500).json({ error: e.message || 'Intelligent processing failed' });
    }
  });

  // AI Chat endpoint
  app.post('/api/staff-chat', async (req, res) => {
    try {
      const { message, staffData } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an AI assistant for a staff tracking system. Answer user questions based on the current staff tracking data provided.\n\nData: ${JSON.stringify(staffData)}\n\nQuestion: ${message}`,
      });
      res.json({ response: response.text });
    } catch (e: any) {
      console.error('AI Chat Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ADMIN: Register standard users and bootstrap 'sigmund.t.d@gaostaff.com' as Admin
  app.post('/api/admin/register', async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }

      const userRoleDocPath = `settings/user_role_${uid}`;
      let existingRole: string | null = null;
      let userData: any = null;

      if (dbAdmin) {
        try {
          const docRef = dbAdmin.doc(userRoleDocPath);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            userData = docSnap.data();
            existingRole = userData?.role;
          }
        } catch (dbErr: any) {
          console.warn('Note: DB Admin fetch role failed inside register, using client fallback:', dbErr.message || dbErr);
        }
      }

      // Check if user is the bootstrapped admin
      const bootstrappedAdmin = 'sigmund.t.d@gaostaff.com';
      let role = existingRole || 'operator';
      if (!existingRole && email.toLowerCase() === bootstrappedAdmin.toLowerCase()) {
        role = 'admin';
      }

      const updatedData = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        updatedAt: new Date().toISOString()
      };

      if (dbAdmin) {
        try {
          await dbAdmin.doc(userRoleDocPath).set(updatedData, { merge: true });
        } catch (dbErr: any) {
          console.warn('Note: DB Admin save user profile failed inside register, using client fallback:', dbErr.message || dbErr);
        }
      }

      // Set custom claims
      if (adminApp) {
        try {
          await admin.auth().setCustomUserClaims(uid, { role });
          console.log(`Successfully configured custom claim role=${role} for ${uid}`);
        } catch (claimsErr: any) {
          console.warn('Note: Admin auth config custom claim failed inside register, using local fallback:', claimsErr.message || claimsErr);
        }
      }

      res.json({ success: true, role, userData: updatedData });
    } catch (e: any) {
      console.error('Admin auto-register API Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ADMIN: Create a user account manually with custom designated role claims
  app.post('/api/admin/create-user', async (req, res) => {
    try {
      const { email, password, displayName, role } = req.body;
      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Missing email, password, or role' });
      }

      const validRoles = ['admin', 'manager', 'operator', 'blocked'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid custom claims role' });
      }

      if (!adminApp) {
        return res.status(500).json({ error: 'Firebase Administration App is not initialized' });
      }

      // 1. Create the user credential in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      });

      const uid = userRecord.uid;

      // 2. Assign dynamic custom role claim immediately
      await admin.auth().setCustomUserClaims(uid, { role });
      console.log(`Successfully provisioned claims role=${role} for user=${uid}`);

      // 3. Persist the metadata profile document inside Firestore settings database
      const userRoleDocPath = `settings/user_role_${uid}`;
      const userData = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        updatedAt: new Date().toISOString()
      };

      if (dbAdmin) {
        await dbAdmin.doc(userRoleDocPath).set(userData, { merge: true });
        console.log(`Persisted Firestore metadata configuration settings for new user ${uid}`);
      }

      res.json({ success: true, user: userData });
    } catch (e: any) {
      console.error('Manual user creation API error:', e);
      let errMsg = e.message || 'Failed to create user account';
      if (errMsg.includes('identitytoolkit.googleapis.com') || errMsg.includes('Identity Toolkit') || errMsg.includes('auth/internal-error')) {
        errMsg = 'The Google Identity Toolkit API is not fully activated or is disabled on this GCP project. To resolve this, you must run Firebase Setup via your workspace or enable Identity Toolkit in the GCP API Console. Alternative: Users can sign in (or register) directly via the client application, after which they will appear in the "Registered Accounts" roster below and you can elevate them to Manager, Operator or Admin instantly!';
      }
      res.status(500).json({ error: errMsg });
    }
  });

  // ADMIN: List all registered roles
  app.get('/api/admin/users', async (req, res) => {
    try {
      let users: any[] = [];
      if (dbAdmin) {
        try {
          const settingsColl = dbAdmin.collection('settings');
          const snapshot = await settingsColl.get();
          snapshot.forEach(doc => {
            if (doc.id.startsWith('user_role_')) {
              users.push(doc.data());
            }
          });
        } catch (dbErr: any) {
          console.warn('Note: DB Admin get users list failed:', dbErr.message || dbErr);
        }
      }

      // Safeguard: always have a bootstrapped operator at least, or return what's available
      if (users.length === 0) {
        users = [
          {
            uid: 'sigmund_ts_boot',
            email: 'sigmund.t.d@gaostaff.com',
            displayName: 'sigmund.t.d',
            role: 'admin',
            updatedAt: new Date().toISOString()
          }
        ];
      }

      res.json({ users });
    } catch (e: any) {
      console.error('Admin list users API Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ADMIN: Modify user custom claims
  app.post('/api/admin/set-user-role', async (req, res) => {
    try {
      const { uid, role } = req.body;
      if (!uid || !role) {
        return res.status(400).json({ error: 'Missing uid or role' });
      }

      const validRoles = ['admin', 'manager', 'operator', 'blocked'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const userRoleDocPath = `settings/user_role_${uid}`;
      if (dbAdmin) {
        try {
          await dbAdmin.doc(userRoleDocPath).set({
            role,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr: any) {
          console.warn('Note: DB Admin change user role state failed (using client settings fallback):', dbErr.message || dbErr);
        }
      }

      if (adminApp) {
        try {
          await admin.auth().setCustomUserClaims(uid, { role });
          console.log(`Successfully completed firebase custom claims modification for user ${uid} to role ${role}`);
        } catch (claimsErr: any) {
          console.warn('Note: Admin auth custom user claims change failed, relying on client setting fallback:', claimsErr.message || claimsErr);
        }
      }

      res.json({ success: true, uid, role });
    } catch (e: any) {
      console.error('Admin set user role API Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ADMIN: Get/Load specific role permissions configuration
  app.get('/api/admin/permissions', async (req, res) => {
    try {
      const docPath = 'settings/role_permissions';
      let permissions = {
        admin: { dashboard: true, settings: true, tracking: true, playback: true, personnel: true, devices: true },
        manager: { dashboard: true, settings: false, tracking: true, playback: true, personnel: true, devices: true },
        operator: { dashboard: false, settings: false, tracking: true, playback: false, personnel: true, devices: false },
        blocked: { dashboard: false, settings: false, tracking: false, playback: false, personnel: false, devices: false }
      };

      if (dbAdmin) {
        try {
          const snap = await dbAdmin.doc(docPath).get();
          if (snap.exists) {
            permissions = { ...permissions, ...snap.data() };
          } else {
            await dbAdmin.doc(docPath).set(permissions);
          }
        } catch (dbErr: any) {
          console.warn('Note: DB Admin load permissions configuration failed, using local JSON permissions fallback:', dbErr.message || dbErr);
        }
      }
      res.json(permissions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ADMINUpdate/modify role permissions
  app.post('/api/admin/permissions', async (req, res) => {
    try {
      const permissions = req.body;
      const docPath = 'settings/role_permissions';
      if (dbAdmin) {
        try {
          await dbAdmin.doc(docPath).set(permissions);
        } catch (dbErr: any) {
          console.warn('Note: DB Admin update permissions list failed:', dbErr.message || dbErr);
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Proxy the GAO APIs with fully-dynamic target host and auth configuration
  const DEFAULT_GAO_API_HOST = 'https://www.i360services.com/peopletrackinguhf';

  async function getGaoHeadersAndUrl(req: express.Request, path: string) {
    const targetHost = (req.headers['x-gao-target-host'] as string) || DEFAULT_GAO_API_HOST;
    const cleanHost = targetHost.replace(/\/$/, '');
    const url = `${cleanHost}${path}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const authType = req.headers['x-gao-auth-type'] as string;
    
    if (authType === 'api_key') {
      const key = req.headers['x-gao-api-key'] as string;
      const keyHeader = (req.headers['x-gao-api-key-header'] as string) || 'X-API-Key';
      if (key) {
        headers[keyHeader] = key;
      }
    } else if (authType === 'bearer') {
      const token = req.headers['x-gao-bearer-token'] as string;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (authType === 'basic') {
      const username = req.headers['x-gao-username'] as string;
      const password = req.headers['x-gao-password'] as string;
      if (username && password) {
        const creds = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${creds}`;
      }
    } else if (authType === 'oauth') {
      const clientId = req.headers['x-gao-oauth-client-id'] as string;
      const clientSecret = req.headers['x-gao-oauth-client-secret'] as string;
      const tokenUrl = req.headers['x-gao-oauth-token-url'] as string;

      if (clientId && clientSecret && tokenUrl) {
        try {
          const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
          const tokenRes = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${authString}`
            },
            body: new URLSearchParams({
              grant_type: 'client_credentials'
            })
          });
          if (tokenRes.ok) {
            const tokenJson: any = await tokenRes.json();
            if (tokenJson.access_token) {
              headers['Authorization'] = `Bearer ${tokenJson.access_token}`;
            }
          }
        } catch (oauthErr) {
          console.error('OAuth token exchange error in proxy server:', oauthErr);
        }
      }
    }

    return { url, headers };
  }

  app.get('/api/GetHistoryTotalCount', async (req, res) => {
    try {
      const { url, headers } = await getGaoHeadersAndUrl(req, '/api/GetHistoryTotalCount');
      const gaoRes = await fetch(url, { headers });
      const data = await gaoRes.text();
      res.send(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/GetHistoryRecords/:skip/:take', async (req, res) => {
    try {
      const { skip, take } = req.params;
      const { url, headers } = await getGaoHeadersAndUrl(req, `/api/GetHistoryRecords/${skip}/${take}`);
      const gaoRes = await fetch(url, { headers });
      const data = await gaoRes.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/GetTagsInRealtime', async (req, res) => {
    try {
      const { url, headers } = await getGaoHeadersAndUrl(req, '/api/GetTagsInRealtime');
      const gaoRes = await fetch(url, { headers });
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
