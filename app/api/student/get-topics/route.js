import client from "@/lib/db";

export async function GET() {
  const res = await client.query("SELECT * FROM topics ORDER BY id");
  return Response.json(res.rows);
}
