//teacher/TeacherClient.js
"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

export default function TeacherClient() {
  // ---------- ALL HOOKS AT TOP ----------
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // ---------- AUTH LOAD ----------
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_teacher")
        .eq("id", user.id)
        .single();

      if (!profile?.is_teacher) {
        window.location.href = "/unauthorized";
        return;
      }

      setUserId(user.id);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  // ---------- SAFE EARLY RETURN ----------
  if (loadingUser) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        Loading...
      </div>
    );
  }

  // ---------- LOAD TOPICS ----------
  useEffect(() => {
    async function loadTopics() {
      const res = await fetch("/api/student/get-topics");
      const data = await res.json();
      setTopics(data);
    }
    loadTopics();
  }, []);

  // ---------- LOAD SAVED PATTERNS ----------
  async function loadSavedPatterns(id) {
    const res = await fetch("/api/student/get-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: id }),
    });
    const data = await res.json();
    setSavedPatterns(data);
  }

  // ---------- SAVE TOPIC APPROACH ----------
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

  // ---------- SAVE PATTERN APPROACH ----------
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

    await loadSavedPatterns(topicId);

    const updated = savedPatterns.find(p => p.id === Number(patternId));
    if (updated) {
      setPatternApproach(updated.teacher_preferred_approach || "");
    }

    alert("Pattern-level preferred approach saved.");
  }

  // ---------- GENERATE PATTERNS ----------
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

  // ---------- SAVE PATTERNS ----------
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
        patterns: selectedPatterns,
      }),
    });

    await loadSavedPatterns(topicId);
    alert("Patterns saved.");

    setLoading("");
  }

  // ---------- GENERATE QUESTIONS ----------
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

  // ---------- SAVE QUESTIONS ----------
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

  // ---------- UI ----------
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Teacher Mode</h1>

      {loading && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          background: "#fff3cd",
          border: "1px solid #ffeeba",
        }}>
          {loading}
        </div>
      )}

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

      <h3 style={{ marginTop: "30px" }}>4. Generate Questions for a Pattern</h3>

      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          setPatternId(id);

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

      <p style={{ marginTop: "15px" }}>Difficulty:</p>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <button onClick={generateQuestions} style={{ marginLeft: "10px" }}>
        Generate Questions
      </button>

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
        </>
      )}
    </div>
  );
}
