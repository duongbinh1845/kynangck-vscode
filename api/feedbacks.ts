import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
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
    if (isNaN(Number(payloadStr))) return false;
    if (Number(payloadStr) < Date.now()) return false;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadStr)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

function extractToken(req: VercelRequest): string {
  const authHeader = req.headers.authorization || '';
  return authHeader.replace('Bearer ', '');
}

async function getDataFromSupabase(key: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return [];
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await (supabase.from('app_state') as any)
      .select('data')
      .eq('key', key)
      .single();

    return data?.data || [];
  } catch (err) {
    console.error(`[api/feedbacks] Error:`, err);
    return [];
  }
}

async function writeDataToSupabase(key: string, data: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await (supabase.from('app_state') as any).upsert(
    { key, data },
    { onConflict: 'key' }
  );

  if (error) throw error;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const feedbacks = await getDataFromSupabase('feedbacks');
    return res.status(200).json(feedbacks);
  }

  if (req.method === 'POST') {
    const token = extractToken(req);
    if (!token || !verifyToken(token)) {
      return res
        .status(401)
        .json({ error: 'Yêu cầu xác thực quản trị. Vui lòng đăng nhập lại.' });
    }

    const feedback = req.body;
    if (!feedback) {
      return res.status(400).json({ error: 'Dữ liệu feedback không hợp lệ.' });
    }

    try {
      const feedbacks = await getDataFromSupabase('feedbacks');
      feedbacks.push(feedback);
      await writeDataToSupabase('feedbacks', feedbacks);
      res.status(201).json({ success: true, feedback });
    } catch (err) {
      console.error('[api/feedbacks POST] Error:', err);
      res.status(500).json({ error: 'Lỗi khi lưu feedback.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
