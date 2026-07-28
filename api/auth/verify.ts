import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kynangck-admin';
const SESSION_SECRET = crypto
  .createHash('sha256')
  .update('kynangck-session::' + ADMIN_PASSWORD)
  .digest('hex');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function verifyToken(token: string): boolean {
  try {
    const buf = Buffer.from(token, 'base64');
    const str = buf.toString('utf-8');
    const [payloadStr, sig] = str.split('.');

    if (!payloadStr || !sig) return false;

    const payload = Number(payloadStr);
    if (isNaN(payload)) return false;

    if (payload < Date.now()) return false; // expired

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadStr)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  const valid = token && verifyToken(token);
  res.status(200).json({ valid });
}
