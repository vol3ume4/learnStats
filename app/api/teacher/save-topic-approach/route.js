import client from "@/lib/db";

export async function POST(request) {
  try {
    const { topicId, approach } = await request.json();

    if (!topicId) {
      return Response.json({ error: "Missing topicId" }, { status: 400 });
    }

    await client.query(
      `
      UPDATE topics
      SET teacher_preferred_approach = $1
      WHERE id = $2
      `,
      [approach || "", topicId]
    );

    return Response.json({ success: true });

  } catch (err) {
    console.error("Save Topic Approach Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
