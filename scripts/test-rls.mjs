// Run: node scripts/test-rls.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const envContent = readFileSync(resolve(projectRoot, '.env.local'), 'utf8');
const supabaseUrl = envContent.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const supabaseKey = envContent.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();
const PROJECT_REF = 'wikdhdgdyobunzpaualp';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: holdings } = await supabase.from('holdings').select('*');
    const hId = holdings[0].id;
    const uId = 'e5a69866-b0ce-4dbc-9175-0e928250dac9';

    console.log("Holding ID:", hId);
    console.log("User ID:", uId);

    // We can't change policies directly via the JS client, we need SQL.
    // I will generate the SQL needed to fix the function.
}
check();
