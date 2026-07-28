#!/usr/bin/env tsx
/**
 * Seed Supabase app_state table with initial data from db.ts
 * Run: npx tsx scripts/seed-supabase.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// Import seed data from db.ts (this file depends on db.ts structure)
// For now, we'll read from the local db.json if it exists, or use minimal defaults

async function seedSupabase() {
  console.log('🌱 Starting Supabase seed...\n');

  try {
    // Check if local db.json exists and use it
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    let seedData: any = {};

    if (fs.existsSync(dbPath)) {
      console.log(`📂 Found local db.json at ${dbPath}`);
      const content = fs.readFileSync(dbPath, 'utf-8');
      seedData = JSON.parse(content);
    } else {
      console.log('⚠️  No local db.json found. Using minimal seed data.');
      seedData = {
        projects: [],
        parents: [],
        corporates: [],
        transactions: [],
        news: [],
        notifications: [],
        cms: {
          siteName: 'KynangCK',
          siteDescription: 'Connect Kids',
          footer: {
            companyName: 'Connect Kids',
            contactEmail: 'contact@kynangck.com',
          },
        },
        feedbacks: [],
        guessingGameScreens: [],
      };
    }

    const keys = [
      'projects',
      'parents',
      'corporates',
      'transactions',
      'news',
      'notifications',
      'cms',
      'feedbacks',
      'guessingGameScreens',
    ];

    for (const key of keys) {
      const data = seedData[key] || (key === 'cms' ? seedData.cms : []);

      console.log(`⏳ Upserting "${key}"...`);

      const { error } = await (supabase.from('app_state') as any).upsert(
        { key, data },
        { onConflict: 'key' }
      );

      if (error) {
        console.error(`❌ Error upserting "${key}":`, error);
      } else {
        console.log(`✅ "${key}" seeded successfully`);
      }
    }

    console.log('\n✨ Supabase seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seedSupabase();
