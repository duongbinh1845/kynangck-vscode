import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kynangck-admin';
const SESSION_SECRET = crypto.createHash('sha256').update('kynangck-session::' + ADMIN_PASSWORD).digest('hex');

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    const exp = Number(payload);
    return !!exp && Date.now() <= exp;
  } catch {
    return false;
  }
}

async function getDataFromSupabase(key: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return {};
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await (supabase.from('app_state') as any)
      .select('data')
      .eq('key', key)
      .single();

    return data?.data || {};
  } catch (err) {
    console.error(`[api/${key}] Error:`, err);
    return {};
  }
}

async function updateDataInSupabase(key: string, newData: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured');
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await (supabase.from('app_state') as any)
      .upsert({ key, data: newData }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return data?.data || newData;
  } catch (err) {
    console.error(`[api/update/${key}] Error:`, err);
    throw err;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: Fetch CMS data
  if (req.method === 'GET') {
    const data = await getDataFromSupabase('cms');
    return res.status(200).json(data);
  }

  // POST, PUT, DELETE: Require admin authentication
  const token = (req.headers['authorization'] as string || '').startsWith('Bearer ')
    ? (req.headers['authorization'] as string).slice(7).trim()
    : '';

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }

  const cms = await getDataFromSupabase('cms');
  const { pathname } = new URL(req.url || '', 'http://localhost');

  // POST /api/cms/header
  if (req.method === 'POST' && pathname === '/api/cms/header') {
    cms.header = req.body;
    await updateDataInSupabase('cms', cms);
    return res.status(200).json(cms.header);
  }

  // POST /api/cms/footer
  if (req.method === 'POST' && pathname === '/api/cms/footer') {
    cms.footer = req.body;
    await updateDataInSupabase('cms', cms);
    return res.status(200).json(cms.footer);
  }

  // POST /api/cms/homepage
  if (req.method === 'POST' && pathname === '/api/cms/homepage') {
    cms.homepage = req.body;
    await updateDataInSupabase('cms', cms);
    return res.status(200).json(cms.homepage);
  }

  // POST /api/cms/theme
  if (req.method === 'POST' && pathname === '/api/cms/theme') {
    cms.theme = req.body;
    await updateDataInSupabase('cms', cms);
    return res.status(200).json(cms.theme);
  }

  // POST /api/cms/corporate
  if (req.method === 'POST' && pathname === '/api/cms/corporate') {
    cms.corporate = req.body;
    await updateDataInSupabase('cms', cms);
    return res.status(200).json(cms.corporate);
  }

  // POST /api/cms/pages
  if (req.method === 'POST' && pathname === '/api/cms/pages') {
    if (!cms.pages) cms.pages = [];
    const newPage = {
      id: `page-${Date.now().toString().slice(-6)}`,
      ...req.body,
    };
    cms.pages.push(newPage);
    await updateDataInSupabase('cms', cms);
    return res.status(201).json(newPage);
  }

  // DELETE /api/cms/pages/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/cms/pages/')) {
    const pageId = pathname.split('/').pop();
    if (!cms.pages) cms.pages = [];
    const initialLength = cms.pages.length;
    cms.pages = cms.pages.filter((p: any) => p.id !== pageId);
    if (cms.pages.length === initialLength) {
      return res.status(404).json({ error: 'Page not found' });
    }
    await updateDataInSupabase('cms', cms);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
