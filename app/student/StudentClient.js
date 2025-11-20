"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const supabase = supabaseBrowser;

export default function StudentClient() {
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState(null);

  const [patterns, setPatterns] = useState([]);
  const [patternId, setPatternId] = useState(null);

  const [difficulty, setDifficulty] = useState("Easy");

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");

  const [attemptId, setAttemptId] = useState(null);

  const [showSolution, setShowSolution] = useState(false);

  const [showHintStats, setShowHintStats] = useState(false);
  const [showHintPython, setShowHintPython] = useState(false);

  const [usedHintStats, setUsedHintStats] = useState(false);
  const [usedHintPython, setUsedHintPython] = useState(false);

  const [studentRemark, setStudentRemark] = useState("");

  const [loading, setLoading] = useState("");

  // ---------------- AUTH LOAD ----------------
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  // ---------------- Load Topics ----------------
  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    const res = await fetch("/api/student/get-topics");
    setTopics(await res.json());
  }

  // ---------------- Load Patterns ----------------
  async function loadPatterns(topicId) {
    const res = await fetch("/api/student/get-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId })
    });
    setPatterns(await res.json());
  }

  // ---------------- Reset For New Question ----------------
  function resetStateForNewQuestion() {
    setEvaluation("");
    setAnswer("");

    setShowSolution(false);
    setShowHintStats(false);
    setShowHintPython(false);

    setUsedHintStats(false);
    setUsedHintPython(false);

    setStudentRemark("");
    setAttemptId(null);
  }

  // ---------------- Next Question ----------------
  async function getNextQuestion() {
    if (!patternId || !difficulty) {
      alert("Select topic, pattern, and difficulty.");
      return;
    }

    setLoading("Fetching question...");

    const res = await fetch("/api/student/get-next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        topicId,
        patternId,
        difficulty
      })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      setLoading("");
      return;
    }

    setCurrentQuestion(data);
    resetStateForNewQuestion();
    setLoading("");
  }

  // ---------------- Submit Answer ----------------
  async function submitAnswer() {
    if (!currentQuestion) return;

    setLoading("Checking answer...");

    const res = await fetch("/api/student/save-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        topicId,
        patternId,
        difficulty,
        questionId: currentQuestion.id,
        userAnswer: answer,
        studentRemark,
        usedHintStats,
        usedHintPython
      })
    });

    const data = await res.json();
    setEvaluation(data);
    setAttemptId(data.attemptId);
    setLoading("");
  }

  // ---------------- Save Remark ----------------
  async function saveRemark() {
    if (!attemptId) {
      alert("Submit your answer first.");
      return;
    }

    const res = await fetch("/api/student/update-remark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        studentRemark
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Remark saved.");
    }
  }

  // ---------------- UI ----------------
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Student Mode</h1>

      {loading && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            background: "#fff3cd",
            border: "1px solid #ffeeba"
          }}
        >
          {loading}
        </div>
      )}

      {/* ---------------- Topic ---------------- */}
      <h3>1. Select Topic</h3>
      <select
        onChange={async (e) => {
          const id = Number(e.target.value);
          setTopicId(id);
          setPatternId(null);
          setCurrentQuestion(null);
          setEvaluation("");
          await loadPatterns(id);
        }}
      >
        <option>Select…</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* ---------------- Pattern ---------------- */}
      {topicId && (
        <>
          <h3>2. Select Pattern</h3>
          <select
            onChange={(e) => {
              setPatternId(Number(e.target.value));
              setCurrentQuestion(null);
              setEvaluation("");
            }}
          >
            <option>Select…</option>
            {patterns.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pattern}
              </option>
            ))}
          </select>
        </>
      )}

      {/* ---------------- Difficulty ---------------- */}
      {patternId && (
        <>
          <h3>3. Select Difficulty</h3>
          <select
            onChange={(e) => setDifficulty(e.target.value)}
            value={difficulty}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <button
            onClick={getNextQuestion}
            style={{ marginLeft: "10px", padding: "6px 10px" }}
          >
            Get Question
          </button>
        </>
      )}

      {/* ---------------- Question ---------------- */}
      {currentQuestion && (
        <>
          <h3 style={{ marginTop: "30px" }}>Question</h3>

          <div
            style={{
              background: "#f0f0f0",
              padding: "12px",
              marginBottom: "15px",
              whiteSpace: "pre-wrap"
            }}
          >
            {currentQuestion.question_text}
          </div>

          {/* ---------------- Answer Input ---------------- */}
          {!evaluation && (
            <>
              <input
                type="text"
                placeholder="Your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                style={{ padding: "8px", width: "260px" }}
              />

              <button
                onClick={submitAnswer}
                style={{ marginLeft: "10px", padding: "8px" }}
              >
                Submit
              </button>
            </>
          )}

          {/* ---------------- Hint Buttons ---------------- */}
          <button
            onClick={() => {
              setShowHintStats(!showHintStats);
              setUsedHintStats(true);
            }}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            Hint (Stats)
          </button>

          <button
            onClick={() => {
              setShowHintPython(!showHintPython);
              setUsedHintPython(true);
            }}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            Hint (Python)
          </button>

          {/* ---------------- Show Solution ---------------- */}
          <button
            onClick={() => setShowSolution(true)}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            Show Answer
          </button>

          {/* ---------------- Next Question ---------------- */}
          <button
            onClick={getNextQuestion}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            Next Question
          </button>

          {/* ---------------- Stats Hint ---------------- */}
          {showHintStats && currentQuestion.hint_stats && (
            <div
              style={{
                marginTop: "20px",
                background: "#e0edff",
                padding: "10px",
                whiteSpace: "pre-wrap"
              }}
            >
              <strong>Hint (Stats):</strong>
              <br />
              {currentQuestion.hint_stats}
            </div>
          )}

          {/* ---------------- Python Hint ---------------- */}
          {showHintPython && currentQuestion.hint_python && (
            <div
              style={{
                marginTop: "20px",
                background: "#e0ffe4",
                padding: "10px",
                whiteSpace: "pre-wrap"
              }}
            >
              <strong>Hint (Python):</strong>
              <br />
              {currentQuestion.hint_python}
            </div>
          )}

          {/* ---------------- Student Remark ---------------- */}
          {evaluation && (
            <div style={{ marginTop: "20px" }}>
              <textarea
                placeholder="Post-submit remark (feedback, confusion, protest)"
                value={studentRemark}
                onChange={(e) => setStudentRemark(e.target.value)}
                style={{
                  width: "400px",
                  height: "80px",
                  padding: "8px"
                }}
              />

              <button
                onClick={saveRemark}
                style={{ marginLeft: "10px", padding: "8px" }}
              >
                Save Remark
              </button>
            </div>
          )}

          {/* ---------------- Evaluation ---------------- */}
          {evaluation && evaluation.correct !== undefined && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                borderRadius: "4px",
                whiteSpace: "pre-wrap",
                background:
                  evaluation.correct === true ? "#e2f7e2" : "#ffe5e5"
              }}
            >
              <strong>Correct: </strong>
              {evaluation.correct ? "Yes" : "No"}
              <br />
              <strong>Remark: </strong>
              {evaluation.remark}
            </div>
          )}

          {/* ---------------- Solutions ---------------- */}
          {showSolution && (
            <div
              style={{
                marginTop: "20px",
                background: "#e8ffe8",
                padding: "10px",
                whiteSpace: "pre-wrap"
              }}
            >
              <strong>Solution (Stats):</strong>
              <br />
              {currentQuestion.solution_stats || "Not provided."}

              <br /><br />

              <strong>Solution (Python):</strong>
              <br />
              {currentQuestion.solution_python || "Not provided."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
