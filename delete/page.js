"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Statistics Practice App</h1>

      <p>Select mode:</p>

      <button
        onClick={() => router.push("/teacher")}
        style={{ padding: "10px", marginRight: "20px" }}
      >
        Teacher Mode
      </button>

      <button
        onClick={() => router.push("/student")}
        style={{ padding: "10px" }}
      >
        Student Mode
      </button>
    </div>
  );
}
