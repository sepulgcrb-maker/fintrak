import 'dotenv/config';
import { processAIChat } from '../../src/utils/aiService';

// Helper to extract JSON body from Vercel Serverless Function request
async function getRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  // Handle stream if req.body is not populated
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

// Vercel Serverless Function Handler for /api/ai/chat
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { message, history = [], contextData = {} } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      return;
    }

    const reply = await processAIChat({
      message: message.trim(),
      history,
      contextData,
    });

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    res.status(500).json({
      error: 'Gagal memproses pesan AI. Silakan coba kembali.',
      detail: error?.message || 'Internal error',
    });
  }
}
