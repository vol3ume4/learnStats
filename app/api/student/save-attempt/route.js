import client from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const {
      userId,
      topicId,
      patternId,
      questionId,
      difficulty,
      userAnswer,
      studentRemark,
      usedHintStats = false,
      usedHintPython = false
    } = await request.json();

    // ----------------------------------------------------
    // 1. Load question metadata
    // ----------------------------------------------------
    const q = await client.query(
      `
      SELECT 
        question_text,
        correct_answer,
        hint_stats,
        hint_python,
        solution_stats,
        solution_python,
        solution
      FROM questions 
      WHERE id=$1
      `,
      [questionId]
    );

    if (q.rows.length === 0) {
      return Response.json(
        { error: "Question not found" },
        { status: 400 }
      );
    }

    const row = q.rows[0];
    const questionText = row.question_text.trim();
    const correctAnswer = String(row.correct_answer).trim();

    // ----------------------------------------------------
    // 2. LLM Evaluation (semantic + tolerant)
    // ----------------------------------------------------
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert statistics instructor.

Evaluate the student's answer SEMANTICALLY, allowing:
- numeric equivalents
- rounding differences (±1–2%)
- synonyms (μ/mean, σ/sd)
- format or ordering differences
- punctuation and spacing variations

Correctness is based on meaning, not formatting.

QUESTION
${questionText}

CORRECT ANSWER
${correctAnswer}

STUDENT ANSWER
${userAnswer}

STRICT JSON OUTPUT:
{
  "correct": "yes" or "no",
  "remark": "<short constructive feedback>"
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/```json/i, "").replace(/```/g, "").trim();
    }

    let evalObj;
    try {
      evalObj = JSON.parse(text);
    } catch {
      evalObj = {
        correct: "no",
        remark: "AI evaluation failed. Treating answer as incorrect."
      };
    }

    const isCorrect = evalObj.correct === "yes";

    // ----------------------------------------------------
    // 3. Save attempt → RETURN attemptId
    // ----------------------------------------------------
    const inserted = await client.query(
      `
      INSERT INTO practice_history
      (user_id, topic_id, pattern_id, question_id, difficulty,
       is_correct, user_answer,
       student_remark, ai_remark,
       used_hint_stats, used_hint_python)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
      `,
      [
        userId,
        topicId,
        patternId,
        questionId,
        difficulty,
        isCorrect,
        userAnswer,
        studentRemark || "",
        evalObj.remark || "",
        usedHintStats,
        usedHintPython
      ]
    );

    const attemptId = inserted.rows[0].id;

    // ----------------------------------------------------
    // 4. Return evaluation + everything needed
    // ----------------------------------------------------
    return Response.json({
      correct: isCorrect,
      remark: evalObj.remark,
      attemptId,
      question: {
        ...row,
        correct_answer: correctAnswer
      }
    });

  } catch (err) {
    console.error("save-attempt error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
