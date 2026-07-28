import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function migrateData() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Supabase credentials not found in .env');
    process.exit(1);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Read old database.json from the old repo
    const oldDbPath = '../kynangck-ai-studio/Kynangck_AI_Studio/data/db.json';
    if (!fs.existsSync(oldDbPath)) {
      console.error(`❌ Old database file not found at: ${oldDbPath}`);
      process.exit(1);
    }

    const oldDb = JSON.parse(fs.readFileSync(oldDbPath, 'utf-8'));
    console.log('✅ Loaded old database.json');

    // Fetch current data from Supabase
    const { data: currentData, error: fetchError } = await (supabase.from('app_state') as any)
      .select('*')
      .in('key', ['projects', 'news', 'cms', 'parents', 'corporates', 'transactions', 'notifications']);

    if (fetchError) {
      console.error('❌ Error fetching current data:', fetchError);
      process.exit(1);
    }

    console.log('✅ Fetched current Supabase data');

    // Merge strategy: Merge old data with new data
    // For each key, keep existing new data but fill in missing data from old db
    const mergedData: any = {};

    // Define keys to migrate
    const keysToMigrate = ['projects', 'news', 'cms', 'parents', 'corporates', 'transactions', 'notifications'];

    for (const key of keysToMigrate) {
      const currentRow = currentData?.find((r: any) => r.key === key);
      const oldValue = oldDb[key] || (Array.isArray(oldDb[key]) ? [] : {});
      const currentValue = currentRow?.data || (Array.isArray(oldValue) ? [] : {});

      if (Array.isArray(oldValue) && Array.isArray(currentValue)) {
        // For arrays, merge old and new (avoid duplicates by id)
        const allItems = [...currentValue];
        const existingIds = new Set(currentValue.map((item: any) => item.id));

        const newItemsFromOld = oldValue.filter((item: any) => !existingIds.has(item.id));
        allItems.push(...newItemsFromOld);

        mergedData[key] = allItems;
        console.log(`  📦 ${key}: ${currentValue.length} current + ${newItemsFromOld.length} from old = ${allItems.length} total`);
      } else {
        // For objects, do a shallow merge
        mergedData[key] = { ...oldValue, ...currentValue };
        console.log(`  📦 ${key}: merged object`);
      }
    }

    // Upload merged data back to Supabase
    console.log('\n⏳ Uploading merged data to Supabase...');

    for (const [key, value] of Object.entries(mergedData)) {
      const { error } = await (supabase.from('app_state') as any)
        .upsert({ key, data: value }, { onConflict: 'key' });

      if (error) {
        console.error(`❌ Error uploading ${key}:`, error);
        process.exit(1);
      }
      console.log(`  ✅ ${key} uploaded successfully`);
    }

    console.log('\n✨ Migration completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
