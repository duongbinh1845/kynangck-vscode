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
    console.error(`[api/${key}] Error:`, err);
    return [];
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
  // GET: Fetch all news
  if (req.method === 'GET') {
    const data = await getDataFromSupabase('news');
    return res.status(200).json(data);
  }

  // POST, PUT, DELETE: Require admin authentication
  const token = (req.headers['authorization'] as string || '').startsWith('Bearer ')
    ? (req.headers['authorization'] as string).slice(7).trim()
    : '';

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }

  const news = await getDataFromSupabase('news');

  if (req.method === 'POST') {
    const newArticle = {
      id: `art-${Date.now().toString().slice(-6)}`,
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      category: req.body.category || 'Phương pháp giáo dục',
      type: req.body.type || 'article',
      mediaUrl: req.body.mediaUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      date: new Date().toLocaleDateString('sv-SE'),
      author: req.body.author || 'Chuyên gia KynangCK'
    };

    const updatedNews = [newArticle, ...news];
    await updateDataInSupabase('news', updatedNews);
    return res.status(201).json(newArticle);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const articleIndex = news.findIndex((a: any) => a.id === id);
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    news[articleIndex] = {
      ...news[articleIndex],
      title: req.body.title || news[articleIndex].title,
      excerpt: req.body.excerpt || news[articleIndex].excerpt,
      content: req.body.content || news[articleIndex].content,
      category: req.body.category || news[articleIndex].category,
      type: req.body.type || news[articleIndex].type,
      mediaUrl: req.body.mediaUrl !== undefined ? req.body.mediaUrl : news[articleIndex].mediaUrl,
      thumbnailUrl: req.body.thumbnailUrl !== undefined ? req.body.thumbnailUrl : news[articleIndex].thumbnailUrl,
      author: req.body.author || news[articleIndex].author,
    };

    await updateDataInSupabase('news', news);
    return res.status(200).json(news[articleIndex]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const initialLength = news.length;
    const filtered = news.filter((a: any) => a.id !== id);
    if (filtered.length === initialLength) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await updateDataInSupabase('news', filtered);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
