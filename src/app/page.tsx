"use client";

import { useState } from "react";

export default function Home() {
  const [team, setTeam] = useState("");
  const [data, setData] = useState<any>(null);

  async function fetchData() {
    const res = await fetch(`/api/query?team=${team}`);
    const json = await res.json();
    setData(json);
  }

  return (
    <main style={{ padding: 20 }}>
      <input
        placeholder="Team number"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      />
      <button onClick={fetchData}>Search</button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}