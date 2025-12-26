
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicates() {
  console.log('🔍 Identifying duplicates to delete...');

  // Fetch all units
  const { data: units, error } = await supabase
    .from('units')
    .select('id');

  if (error) {
    console.error('Error fetching units:', error);
    return;
  }

  // Identify UUIDs (length 36) vs Custom IDs (length ~10)
  // UUID regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const toDelete = units.filter(u => uuidRegex.test(u.id)).map(u => u.id);
  const toKeep = units.filter(u => !uuidRegex.test(u.id)).map(u => u.id);

  console.log(`✅ To Keep (Custom IDs): ${toKeep.length}`);
  console.log(`❌ To Delete (UUIDs): ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('No duplicates found!');
    return;
  }

  // Delete them
  const { error: deleteError } = await supabase
    .from('units')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('Error deleting duplicates:', deleteError);
  } else {
    console.log('🚀 Successfully deleted duplicate records.');
  }
}

deleteDuplicates();
