export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>LearnStats</h1>
      <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>Hello IPMX 18</h2>
      <p>Select a mode:</p>
      <ul>
        <li><a href="/student">Student Mode</a></li>
        <li><a href="/teacher">Teacher Mode</a></li>
      </ul>
    </div>
  );
}
