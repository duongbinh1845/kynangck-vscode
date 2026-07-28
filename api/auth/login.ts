import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kynangck-admin';
const SESSION_SECRET = crypto
  .createHash('sha256')
  .update('kynangck-session::' + ADMIN_PASSWORD)
  .digest('hex');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function createToken(): string {
  const payload = String(Date.now() + TOKEN_TTL_MS);
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = String((req.body && req.body.password) || '').trim();

  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu.' });
  }

  let matches = false;
  try {
    matches = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(ADMIN_PASSWORD)
    );
  } catch {
    matches = false;
  }

  if (!matches) {
    return res.status(401).json({ error: 'Mật khẩu không chính xác.' });
  }

  const token = createToken();
  res.status(200).json({ token });
}
