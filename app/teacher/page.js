"use client";

import { useState, useEffect } from "react";

export default function TeacherPage() {
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [topicApproach, setTopicApproach] = useState("");

  const [savedPatterns, setSavedPatterns] = useState([]);
  const [existingPatterns, setExistingPatterns] = useState([]);
  const [generatedPatterns, setGeneratedPatterns] = useState([]);
  const [selectedPatterns, setSelectedPatterns] = useState([]);

  const [patternId, setPatternId] = useState(null);
  const [patternApproach, setPatternApproach] = useState("");

  const [difficulty, setDifficulty] = useState("Easy");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [loading, setLoading] = useState("");

  // ---------------------- Load Topics ----------------------
  useEffect(() => {
    async function loadTopics() {
      const res = await fetch("/api/student/get-topics");
      const data = await res.json();
      setTopics(data);
    }
    loadTopics();
  }, []);

  // ---------------------- Load Patterns for Topic ----------------------
  async function loadSavedPatterns(id) {
    const res = await fetch("/api/student/get-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: id }),
    });
    const data = await res.json();
    setSavedPatterns(data);
  }

  // ---------------------- Save Topic Preferred Approach ----------------------
  async function saveTopicApproach() {
    await fetch("/api/teacher/save-topic-approach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        approach: topicApproach,
      }),
    });

    alert("Topic-level preferred approach saved.");
  }

async function savePatternApproach() {
  if (!patternId) return alert("Select a pattern first.");

  await fetch("/api/teacher/save-pattern-approach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patternId,
      approach: patternApproach,
    }),
  });

  // 🔥 Reload updated patterns from DB
  await loadSavedPatterns(topicId);

  // 🔥 Re-select and update local state
  const updated = savedPatterns.find(p => p.id === Number(patternId));
  if (updated) {
    setPatternApproach(updated.teacher_preferred_approach || "");
  }

  alert("Pattern-level preferred approach saved.");
}

  // ---------------------- Generate Pattern Suggestions ----------------------
  async function generatePatterns() {
    if (!topicId) return alert("Select a topic first.");

    setLoading("Generating pattern suggestions...");

    const res = await fetch("/api/teacher/generate-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, topicName }),
    });

    const data = await res.json();

    setExistingPatterns(data.existing || []);
    setGeneratedPatterns(data.additions || []);
    setSelectedPatterns([]);

    setLoading("");
  }

  // ---------------------- Save Selected Patterns ----------------------
  async function savePatterns() {
    if (selectedPatterns.length === 0) {
      alert("Select at least one pattern.");
      return;
    }

    setLoading("Saving patterns...");

    await fetch("/api/teacher/save-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        patterns: selectedPatterns, // ONLY patterns now
      }),
    });

    await loadSavedPatterns(topicId);
    alert("Patterns saved.");

    setLoading("");
  }

  // ---------------------- Generate Questions ----------------------
  async function generateQuestions() {
    if (!patternId) return alert("Select a pattern first.");

    setLoading("Generating questions...");

    const patternObj = savedPatterns.find((p) => p.id === Number(patternId));

    const res = await fetch("/api/teacher/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        patternId,
        patternText: patternObj.pattern,
        difficulty,
        topicApproach,
        patternApproach,
      }),
    });

    const data = await res.json();
    setGeneratedQuestions(data);
    setSelectedQuestions([]);


    setLoading("");
  }

  // ---------------------- Save Questions ----------------------
  async function saveQuestions() {
  if (!patternId) return alert("Choose a pattern before saving.");

  const selected = selectedQuestions.map(i => generatedQuestions[i]);
  if (selected.length === 0) {
    return alert("Select at least one question before saving.");
  }

  setLoading("Saving questions...");

  await fetch("/api/teacher/save-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topicId,
      patternId,
      difficulty,
      questions: selected,
    }),
  });

  alert("Selected questions saved.");
  setLoading("");
}


  // =========================================================
  // UI
  // =========================================================
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Teacher Mode</h1>

      {loading && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#fff3cd",
            border: "1px solid #ffeeba",
          }}
        >
          {loading}
        </div>
      )}

      {/* ---------------------- TOPIC SELECT ---------------------- */}
      <h3>1. Select Topic</h3>

      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          setTopicId(id);

          const obj = topics.find((t) => t.id === id);
          setTopicName(obj?.name || "");
          setTopicApproach(obj?.teacher_preferred_approach || "");

          loadSavedPatterns(id);
          setGeneratedPatterns([]);
        }}
      >
        <option value="">Select topic…</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* ---------------- TOPIC APPROACH EDITOR ---------------- */}
      {topicId && (
        <>
          <h3 style={{ marginTop: "20px" }}>2. Topic Preferred Approach</h3>

          <textarea
            value={topicApproach}
            onChange={(e) => setTopicApproach(e.target.value)}
            placeholder="Describe preferred method for this topic"
            style={{ width: "450px", height: "70px", padding: "8px" }}
          />

          <button onClick={saveTopicApproach} style={{ marginTop: "8px" }}>
            Save Topic Approach
          </button>
        </>
      )}

      {/* ---------------------- GENERATE PATTERN SUGGESTIONS ---------------------- */}
      <h3 style={{ marginTop: "30px" }}>3. Generate Pattern Suggestions</h3>
      <button onClick={generatePatterns}>Generate Patterns</button>

      {existingPatterns.length > 0 && (
        <>
          <h4>Existing Patterns</h4>
          <ul>
            {existingPatterns.map((p, i) => (
              <li key={i}>{typeof p === "string" ? p : p.pattern}</li>
            ))}
          </ul>
        </>
      )}

      {generatedPatterns.length > 0 && (
        <>
          <h4>Suggestions</h4>
          {generatedPatterns.map((p, i) => (
            <div key={i}>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked)
                    setSelectedPatterns([...selectedPatterns, p.pattern]);
                  else
                    setSelectedPatterns(
                      selectedPatterns.filter((x) => x !== p.pattern)
                    );
                }}
              />
              {p.pattern}
            </div>
          ))}

          <button onClick={savePatterns} style={{ marginTop: "10px" }}>
            Save Selected Patterns
          </button>
        </>
      )}

      {/* ---------------------- PATTERN SELECT + APPROACH ---------------------- */}
      <h3 style={{ marginTop: "30px" }}>4. Generate Questions for a Pattern</h3>

      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          setPatternId(id);

          // Always fetch the most up-to-date pattern approach
          const pObj = savedPatterns.find((p) => p.id === id);

          setPatternApproach(pObj?.teacher_preferred_approach || "");
        }}
      >
        <option value="">Select pattern…</option>
        {savedPatterns.map((p) => (
          <option key={p.id} value={p.id}>
            {p.pattern}
          </option>
        ))}
      </select>


      {/* PATTERN APPROACH EDITOR */}
      {patternId && (
        <>
          <h4 style={{ marginTop: "15px" }}>Pattern Preferred Approach</h4>
          <textarea
            value={patternApproach}
            onChange={(e) => setPatternApproach(e.target.value)}
            style={{ width: "450px", height: "70px", padding: "8px" }}
          />

          <button onClick={savePatternApproach} style={{ marginTop: "8px" }}>
            Save Pattern Approach
          </button>
        </>
      )}

      {/* ------------------ DIFFICULTY + GENERATE QUESTIONS ------------------ */}
      <p style={{ marginTop: "15px" }}>Difficulty:</p>

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <button onClick={generateQuestions} style={{ marginLeft: "10px" }}>
        Generate Questions
      </button>

      {/* ---------------------- SHOW GENERATED QUESTIONS ---------------------- */}
      {generatedQuestions.length > 0 && (
        <>
          <h3 style={{ marginTop: "20px" }}>Generated Questions</h3>

          <ul>
  {generatedQuestions.map((q, i) => {
    const checked = selectedQuestions.includes(i);

    return (
      <li key={i} style={{ marginBottom: "15px" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            if (checked) {
              setSelectedQuestions(selectedQuestions.filter(x => x !== i));
            } else {
              setSelectedQuestions([...selectedQuestions, i]);
            }
          }}
          style={{ marginRight: "8px" }}
        />

        <strong>{q.question_text}</strong>
        <br />
        <em>Correct Answer:</em> {q.correct_answer}
        <br />
        <em>Hint (Stats):</em> {q.hint_stats}
        <br />
        <em>Hint (Python):</em> {q.hint_python}
        <br />
        <em>Solution (Stats):</em> {q.solution_stats}
        <br />
        <em>Solution (Python):</em> {q.solution_python}
      </li>
    );
  })}
</ul>

<button onClick={saveQuestions}>Save Selected Questions</button>


          <button onClick={saveQuestions}>Save Questions</button>
        </>
      )}
    </div>
  );
}
