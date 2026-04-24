import { TBA } from "@/lib/tbaService";
import MultiviewClient from "../../../../components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function normalizeTeams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export default async function DivisionalEvent({ params, searchParams }) {
  const { parentEvent } = await params;

  const sp = await searchParams;
  const teams = normalizeTeams(sp.team);

  const parent = await TBA.getEvent(parentEvent);
  const divisionKeys = parent?.division_keys || [];

  const divisions = [];
  for (const key of divisionKeys) {
    const res = await fetch(`${baseUrl}/api/event/${key}`);
    const division = await res.json();
    divisions.push(division);
  }

  return (
    <MultiviewClient isDivisional={true} parentEvent={parent}>
      {/* Divisions */}
      {divisions.map((division) => (
        <GamedayWidget
          key={division.key}
          event={division.key}
          initialTeams={teams}
          eventName={division.short_name}
          isDivisional={true}
        />
      ))}
      {/* Parent event */}
      <GamedayWidget
        key={parent.key}
        event={parent.key}
        initialTeams={teams}
        eventName={parent.short_name}
        isDivisional={true}
      />
    </MultiviewClient>
  );
}