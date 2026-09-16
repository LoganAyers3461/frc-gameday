"use client";

import MatchCard from "./MatchCard";

export default function MatchStrip({
  matches = [],
  team = [],
  nextMatch = null,
  lastMatch = null,
  eventTimezone,
  playoffAlliances = [],
}) {
  const seen = new Set();
  const cards = [];

  for (const match of [lastMatch, nextMatch, ...matches]) {
    if (!match?.key || seen.has(match.key)) continue;

    seen.add(match.key);
    cards.push(match);
  }

  if (!cards.length) return null;

  return (
    <div className="flex h-full min-w-max items-center gap-1.5 px-1">
      {cards.map((match) => (
        <MatchCard
          key={match.key}
          match={match}
          team={team}
          isNext={match.key === nextMatch?.key}
          isLast={match.key === lastMatch?.key}
          playoffAlliances={playoffAlliances}
          eventTimezone={eventTimezone}
        />
      ))}
    </div>
  );
}