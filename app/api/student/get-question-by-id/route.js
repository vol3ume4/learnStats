import client from "@/lib/db";

export async function POST(request) {
  const { id } = await request.json();

  const res = await client.query(
    "SELECT * FROM questions WHERE id=$1",
    [id]
  );

  return Response.json(res.rows[0]);
}
