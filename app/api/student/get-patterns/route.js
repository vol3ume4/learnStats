import client from "@/lib/db";

export async function POST(request) {
  const { topicId } = await request.json();
  const res = await client.query(
    "SELECT * FROM patterns WHERE topic_id=$1 ORDER BY id",
    [topicId]
  );
  return Response.json(res.rows);
}
