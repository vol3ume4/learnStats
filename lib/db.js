// lib/db.js

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

  // Connect and handle initial connection errors
  global._pgClient.connect()
    .then(() => {
      console.log("Supabase DB connected");
    })
    .catch(err => {
      console.error("Failed to connect to Supabase DB:", err.message);
      // Don't crash the app immediately, but subsequent queries will fail
    });

  // Handle unexpected errors on the idle client
  global._pgClient.on('error', err => {
    console.error('Unexpected error on idle Supabase DB client', err);
    // In a production app, you might want to reconnect here
  });

} else {
  client = global._pgClient;
}

export default client;
