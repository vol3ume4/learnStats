import client from "@/lib/db";

export async function POST(request) {
  try {
    const { attemptId, studentRemark } = await request.json();

    if (!attemptId) {
      return Response.json(
        { error: "Missing attemptId" },
        { status: 400 }
      );
    }

    await client.query(
      `
      UPDATE practice_history
      SET student_remark = $1
      WHERE id = $2
      `,
      [studentRemark || "", attemptId]
    );

    return Response.json({ success: true });

  } catch (err) {
    console.error("update-remark error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
