"use client";

import { formatAlliance, matchCode } from "@/lib/tbaFormatters";

export default function MatchList({
  matches = [],
  team,
  nextMatchKey,
  eventTimezone,
  teamView,
}) {
  if (!matches.length) return null;

  const now = Date.now();

  const filtered = matches.filter((m) => {
    const time = (m?.predicted_time || 0) * 1000;

    // keep future matches
    const isFuture = time > now;

    // ALWAYS keep next match even if stale timestamp
    const isNextMatch = m?.key === nextMatchKey;

    const isTeamMatch = team && m.isTeamMatch;

    return isFuture || isNextMatch || isTeamMatch;
  });

  const sorted = [...filtered].sort(
    (a, b) => (a?.predicted_time || 0) - (b?.predicted_time || 0)
  );

  return (
    <div className="flex gap-2 overflow-x-auto w-full">
      {sorted.map((m) => {
        const red = m?.alliances?.red?.team_keys || [];
        const blue = m?.alliances?.blue?.team_keys || [];

        return (
          <div
            key={m.key}
            className="bg-neutral-800 p-2 rounded flex gap-2 items-center min-w-[220px]"
          >
            <div>
              <div className="text-center">{matchCode(m.key)}</div>
              <div className="text-nowrap">
                {m.predicted_time ? (
                  <span className="text-sm text-gray-400">
                    {new Date(m.predicted_time * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400"></span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-red-400 text-nowrap">
                {formatAlliance(red, team)}
              </div>

              <div className="text-blue-400 text-nowrap">
                {formatAlliance(blue, team)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}