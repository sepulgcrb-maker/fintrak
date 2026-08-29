import type { IncomingMessage, ServerResponse } from 'http';
import { processAIChat } from '../../src/utils/aiService';

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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // body remains string or empty
      }
    }

    const { message, history = [], contextData = {} } = body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      return;
    }

    const reply = await processAIChat({
      message,
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
