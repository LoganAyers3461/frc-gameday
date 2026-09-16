"use client";

import MatchCard from "./MatchCard";
import EventLocalTime from "./EventLocalTime";

export default function MatchStrip({
  matches = [],
  team = [],
  nextMatch = null,
  lastMatch = null,
  eventTimezone,
  playoffAlliances = [],
  playoffType = null,
  eventName,
  showEventInfo = true,
  isDivisional = false,
  multiview = {},
}) {
  const seen = new Set();
  const cards = [];

  for (const match of [
    lastMatch,
    nextMatch,
    ...matches,
  ]) {
    if (!match?.key || seen.has(match.key)) {
      continue;
    }

    seen.add(match.key);
    cards.push(match);
  }

  const hideMatchCards =
    multiview?.matchInfo === "hidden";

  return (
    <div className="relative border-t border-l border-white/10 bg-neutral-950/95">
      {showEventInfo && (
        <div className="absolute bottom-full left-0 z-10 -mb-px flex max-w-[min(80vw,360px)]">
          <div className="rounded-t-lg border-x border-t border-white/10 bg-neutral-950 px-2 py-0 shadow-lg">
            <div
              className={`flex flex-col whitespace-nowrap leading-none ${
                hideMatchCards ? "translate-y-[-1px] py-1" : "translate-y-[5px]"
              }`}
            >
              <span className="truncate text-[11px] font-bold text-white">
                {eventName || "Event"}
              </span>

              {eventTimezone && !isDivisional && (
                <span className="mt-0.5 text-[9px] text-neutral-500">
                  <EventLocalTime timezone={eventTimezone} />
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!hideMatchCards && (
        <div className="h-[52px] overflow-x-auto overflow-y-hidden no-scrollbar">
          {cards.length > 0 ? (
            <div className="flex h-full min-w-max items-center gap-1.5 px-2">
              {cards.map((match) => (
                <MatchCard
                  key={match.key}
                  match={match}
                  team={team}
                  isNext={match.key === nextMatch?.key}
                  isLast={match.key === lastMatch?.key}
                  playoffAlliances={playoffAlliances}
                  playoffType={playoffType}
                  eventTimezone={eventTimezone}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center px-3 text-[10px] text-neutral-600">
              No match data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}