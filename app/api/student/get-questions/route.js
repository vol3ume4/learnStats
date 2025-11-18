import client from "@/lib/db";

export async function POST(request) {
  const { patternId } = await request.json();
  const res = await client.query(
    "SELECT id, question_text FROM questions WHERE pattern_id=$1 ORDER BY id",
    [patternId]
  );
  return Response.json(res.rows);
}
