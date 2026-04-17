"use client";

import { useState } from "react";

export default function Home() {
  const [team, setTeam] = useState("");
  const [teamData, setTeamData] = useState<any>(null);
  const [event, setEvent] = useState("");
  const [eventData, setEventData] = useState<any>(null);

  async function fetchTeam() {
    const res = await fetch(`api/team/${team}`);
    const json = await res.json();
    setTeamData(json);
  }

  async function fetchEvent() {
    const res = await fetch(`api/event/${event}`);
    const json = await res.json();
    setEventData(json);
  }
  return (
    <main style={{ padding: 20 }}>
      <input
        placeholder="Team number"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      />
      <button onClick={fetchTeam}>Search</button>

      <pre>{JSON.stringify(teamData, null, 2)}</pre>

      <input
        placeholder="Event key"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
      />
      <button onClick={fetchEvent}>Search</button>

      <pre>{JSON.stringify(eventData, null, 2)}</pre>
    </main>
  );
}