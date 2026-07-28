import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function getProjectsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[api/projects] Supabase config missing');
    return [];
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await (supabase.from('app_state') as any)
      .select('data')
      .eq('key', 'projects')
      .single();

    if (error) {
      console.error('[api/projects] Supabase error:', error);
      return [];
    }

    return data?.data || [];
  } catch (err) {
    console.error('[api/projects] Exception:', err);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const projects = await getProjectsFromSupabase();
  res.status(200).json(projects);
}
