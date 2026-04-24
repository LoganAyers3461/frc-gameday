const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";

function normalizeParams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export default async function DivisionalEvent({ params, searchParams }) {
  const { parentEvent } = await params;

  const sp = await searchParams;
  const teams = normalizeParams(sp.team);
  const eventKeys = normalizeParams(sp.event)
  const events = [];
  for (const key of eventKeys) {
    const res = await fetch(`${baseUrl}/api/event/${key}`);
    const event = await res.json();
    events.push(event);
  }

  return (
    <MultiviewClient isDivisional={false}>
      {/* Divisions */}
      {events.map((event) => (
        <GamedayWidget
          key={event.key}
          event={event.key}
          initialTeams={teams}
          eventName={event.short_name || event.name || event.key}
          isDivisional={false}
        />
      ))}
    </MultiviewClient>
  );
}