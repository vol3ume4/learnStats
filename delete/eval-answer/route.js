import client from "@/lib/db";

export async function POST(request) {
  try {
    const { questionId, userAnswer, userId = "student1" } =
      await request.json();

    if (!questionId || userAnswer === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing questionId or userAnswer" }),
        { status: 400 }
      );
    }

    // 1. Load correct answer from DB
    const qres = await client.query(
      `SELECT correct_answer, pattern_id 
       FROM questions 
       WHERE id = $1`,
      [questionId]
    );

    if (qres.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Question not found" }),
        { status: 404 }
      );
    }

    const correctAnswer = qres.rows[0].correct_answer;
    const patternId = qres.rows[0].pattern_id;

    // 2. Numerical comparison
    function normalize(x) {
      if (x === null || x === undefined) return null;
      try {
        return Number(eval(String(x)));   // allows "3C0*0.2^0*0.8^3"
      } catch {
        return Number(x);
      }
    }

    const ua = normalize(userAnswer);
    const ca = normalize(correctAnswer);

    let isCorrect = false;

    if (!isNaN(ua) && !isNaN(ca)) {
      isCorrect = Math.abs(ua - ca) < 1e-6;
    }

    // 3. Save to practice_history
    await client.query(
      `
      INSERT INTO practice_history 
      (user_id, topic_id, pattern_id, question_id, user_answer, is_correct, time_taken)
      VALUES (
        $1,
        (SELECT topic_id FROM patterns WHERE id = $2),
        $2,
        $3,
        $4,
        $5,
        0
      )
      `,
      [
        userId,
        patternId,
        questionId,
        String(userAnswer),
        isCorrect
      ]
    );

    // 4. Response
    return new Response(
      JSON.stringify({
        correct: isCorrect ? "yes" : "no",
        remark: isCorrect
          ? "Correct"
          : `Incorrect. Correct answer is ${correctAnswer}`
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Eval error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
