// Apply SQL migrations to Supabase PostgreSQL
// Run: node scripts/migrate.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pg = require('pg');

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const PROJECT_REF = 'wikdhdgdyobunzpaualp';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || 'WImmwAlJ+ZLqzxT1IW7p/h6V0LNle2PPynXcll0CJWd0W8213HfiFsoJr36rNUwkNVnKkJGIM+DKtHssOuXYaQ==';

const connectionConfigs = [
    // Session mode pooler (supports transactions, prepared statements)
    { name: 'Pooler session (eu-west-2)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres` },
    { name: 'Pooler session (eu-west-3)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres` },
    { name: 'Pooler session (eu-central-1)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` },
    { name: 'Pooler session (us-east-1)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres` },

    // Transaction mode pooler
    { name: 'Pooler txn (eu-west-3)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres` },
    { name: 'Pooler txn (eu-central-1)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres` },

    // Direct DB
    { name: 'Direct DB (alt)', connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres` },
    { name: 'Direct DB', connectionString: `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres` },
];

const SQL_FILE = resolve(projectRoot, 'supabase/migrations/combined_migration.sql');

async function tryConnect(config) {
    const client = new pg.Client({
        connectionString: config.connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 6000,
    });
    try {
        await client.connect();
        console.log(`  ✅ Connected via ${config.name}`);
        return client;
    } catch (err) {
        console.log(`  ❌ ${config.name}: ${err.message.substring(0, 60)}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Connecting to Supabase PostgreSQL...\n');

    let client = null;
    for (const config of connectionConfigs) {
        client = await tryConnect(config);
        if (client) break;
    }

    if (!client) {
        console.error('\n❌ Could not connect with any method.');
        process.exit(1);
    }

    try {
        const sql = readFileSync(SQL_FILE, 'utf8');
        console.log('\n📄 Running combined_migration.sql...');
        await client.query(sql);
        console.log('✅ All tables created successfully!');
    } catch (err) {
        console.error(`\n❌ Error: ${err.message}`);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
