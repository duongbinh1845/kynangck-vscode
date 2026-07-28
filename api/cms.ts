import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = await getDataFromSupabase('cms');
  res.status(200).json(data);
}
