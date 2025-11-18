import pkg from "pg";
const { Client } = pkg;

// Reuse the same client during dev (hot reload safe)
let client;

if (!global._pgClient) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  global._pgClient = client;
  global._pgClient.connect().then(() => {
    console.log("Supabase DB connected");
  });
} else {
  client = global._pgClient;
}

export default client;
