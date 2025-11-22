const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('✅ Loaded .env.local');
} else {
    console.warn('⚠️ .env.local not found. Relying on system environment variables.');
}

// 2. Check for required variables
const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
];

let missing = false;
requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing environment variable: ${varName}`);
        missing = true;
    } else {
        console.log(`✅ Found ${varName}`);
    }
});

if (missing) {
    console.error('Please set the missing environment variables in .env.local');
    process.exit(1);
}

// 3. Test Database Connection
console.log('\nTesting Database Connection...');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

(async () => {
    try {
        await client.connect();
        console.log('✅ Connected to Supabase PostgreSQL!');

        const res = await client.query('SELECT NOW() as now, version()');
        console.log('✅ Query successful:', res.rows[0]);

        await client.end();
        console.log('✅ Connection closed cleanly.');
        console.log('\n🎉 All checks passed! Your environment is ready.');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.error('   -> Check your database password in DATABASE_URL');
        } else if (err.message.includes('getaddrinfo')) {
            console.error('   -> Check your database hostname in DATABASE_URL');
        }
        process.exit(1);
    }
})();
