"use client";

import { formatAlliance, matchCode } from "@/lib/tbaFormatters";
import { formatEventTime } from "../../../lib/time";

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
    const isFuture = time > now;

    const isTeamMatch =
      teamView?.enabled &&
      teamView?.teamMatchKeys?.includes(m.key) &&
      m.key !== nextMatchKey;

    return (
      (teamView?.enabled && isTeamMatch && isFuture) ||
      (!teamView?.enabled && isFuture)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => (a?.predicted_time || 0) - (b?.predicted_time || 0)
  );

  return (
  <div className="flex gap-2 w-full overflow-x-auto no-scrollbar">
      {sorted.map((m) => {
        const red = m?.alliances?.red?.team_keys || [];
        const blue = m?.alliances?.blue?.team_keys || [];

        return (
          <div
            key={m.key}
            className="bg-neutral-800 p-2 rounded flex gap-2 items-center shrink-0"
          >
            <div className="flex flex-col">
              <div className="text-center">{matchCode(m.key)}</div>
              <div className="text-xs text-gray-400">
                {m.predicted_time
                  ? formatEventTime(m.predicted_time, eventTimezone)
                  : ""}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-red-400">
                {formatAlliance(red, team?.key)}
              </div>
              <div className="text-blue-400">
                {formatAlliance(blue, team?.key)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}