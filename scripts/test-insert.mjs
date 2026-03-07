// Run: node scripts/test-insert.mjs
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
    console.log("Checking holdings...");
    const { data: holdings, error: hErr } = await supabase.from('holdings').select('*');
    console.log("Holdings:", holdings?.length, "Error:", hErr || "None");

    if (holdings?.length > 0) {
        console.log("Checking filiales insert constraint using service role (bypasses RLS)...");
        const { data, error } = await supabase.from('filiales').insert({
            name: "Test API",
            slug: "test-api",
            holding_id: holdings[0].id
        }).select();

        console.log("Insert result:", JSON.stringify(data, null, 2));
        console.log("Insert error:", JSON.stringify(error, null, 2) || "Success");

        if (data && data.length > 0) {
            await supabase.from('filiales').delete().eq('id', data[0].id);
        }
    } else {
        console.log("No holdings found to test filiale creation.");
    }
}
check();
