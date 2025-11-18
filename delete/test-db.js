import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    await client.connect();
    console.log("CONNECTED TO SUPABASE ✔");
    const res = await client.query("SELECT NOW()");
    console.log("Sample query result:", res.rows);
  } catch (err) {
    console.error("CONNECTION FAILED ✘");
    console.error(err);
  } finally {
    await client.end();
  }
}

testConnection();
