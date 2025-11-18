import { getClient } from '@/lib/db';

export async function GET() {
  const client = await getClient();
  const result = await client.query(
    'SELECT * FROM binomial_questions ORDER BY RANDOM() LIMIT 1'
  );
  await client.end();
  return new Response(JSON.stringify(result.rows[0]), { status: 200 });
}
