import client from "@/lib/db";

export async function POST(request) {
  try {
    const { patternId, approach } = await request.json();

    if (!patternId) {
      return Response.json({ error: "Missing patternId" }, { status: 400 });
    }

    await client.query(
      `
      UPDATE patterns
      SET teacher_preferred_approach = $1
      WHERE id = $2
      `,
      [approach || "", patternId]
    );

    return Response.json({ success: true });

  } catch (err) {
    console.error("Save Pattern Approach Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
