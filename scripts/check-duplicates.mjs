
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

async function checkDuplicates() {
  const { data: units, error } = await supabase
    .from('units')
    .select('id, tipologia, price, created_at');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${units.length} units.`);
  console.table(units);
  
  // Count by ID type/pattern
  const opIds = units.filter(u => u.id.includes('OP'));
  const uuidIds = units.filter(u => !u.id.includes('OP'));
  
  console.log(`Units with 'OP' in ID: ${opIds.length}`);
  console.log(`Units with UUID/Other ID: ${uuidIds.length}`);
}

checkDuplicates();
