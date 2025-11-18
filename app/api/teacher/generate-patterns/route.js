import { GoogleGenerativeAI } from "@google/generative-ai";
import client from "@/lib/db";

export async function POST(request) {
  try {
    const { topicId, topicName } = await request.json();

    // ---------------------------------------------------------
    // 1. Load existing patterns (pattern + preferred approach)
    // ---------------------------------------------------------
    const existingRes = await client.query(
      `
      SELECT pattern, teacher_preferred_approach
      FROM patterns
      WHERE topic_id = $1
      ORDER BY id
      `,
      [topicId]
    );

    const existingPatterns = existingRes.rows.map(r => r.pattern);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ---------------------------------------------------------
    // 2. Prompt: generate ONLY new patterns (simple + strict)
    // ---------------------------------------------------------
    const prompt = `
You are an expert STATISTICS instructor.

TOPIC: "${topicName}"

Here are the CURRENT problem patterns used:
${JSON.stringify(existingPatterns, null, 2)}

TASK:
Suggest NEW problem-pattern templates ONLY IF they add genuine statistical learning value.
If nothing meaningful can be added, return [].

STRICT RULES:
- A “pattern” is a short template describing a TYPE of statistics question.
- DO NOT generate full questions.
- DO NOT repeat or paraphrase existing patterns.
- DO NOT generate non-statistics patterns.
- No more than 3 new patterns.
- If nothing valuable, return [].

FORMAT (STRICT):
[
  {"pattern": "..."},
  {"pattern": "..."}
]
No commentary.
No extra text.
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/```json/i, "").replace(/```/g, "").trim();
    }

    const additions = JSON.parse(text);

    // ---------------------------------------------------------
    // 3. Return existing + new ones
    // ---------------------------------------------------------
    return Response.json({
      existing: existingRes.rows,   // includes pattern + preferred approach
      additions                     // new patterns only
    });

  } catch (err) {
    console.error("Pattern generation error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
