// Run: node scripts/test-members.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const envContent = readFileSync(resolve(projectRoot, '.env.local'), 'utf8');
const supabaseUrl = envContent.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const supabaseKey = envContent.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users } = await supabase.from('profiles').select('id, email').limit(5);
    console.log("Users:", users);

    const { data: holdings } = await supabase.from('holdings').select('*');
    console.log("Holdings:", holdings);

    const { data: members } = await supabase.from('holding_members').select('*');
    console.log("Holding Members:", members);
}
check();
