"use client";

import { useEffect, useState } from "react";

function teamNumber(key) {
  return String(key || "").replace(/^frc/i, "");
}

function teamStatusSummary(status, teamCount) {
  const ranking = status?.qual?.ranking;

  if (!ranking) {
    return {
      record: "—",
      rank: "—",
    };
  }

  const record = ranking.record;

  const wins = record?.wins ?? 0;
  const losses = record?.losses ?? 0;
  const ties = record?.ties ?? 0;

  return {
    record: `${wins}-${losses}-${ties}`,
    rank:
      ranking.rank != null
        ? `#${ranking.rank}/${teamCount || "?"}`
        : "—",
  };
}

function compactNextMatch(match) {
  if (!match) return null;

  const level = String(match.comp_level || "").toLowerCase();
  const number = match.match_number ?? "";
  const set = match.set_number;

  switch (level) {
    case "qm":
      return `Q${number}`;

    case "ef":
      return set != null ? `EF${set}-${number}` : `EF${number}`;

    case "qf":
      return set != null ? `QF${set}-${number}` : `QF${number}`;

    case "sf":
      return set != null ? `SF${set}-${number}` : `SF${number}`;

    case "f":
      return `F${number}`;

    default:
      return level
        ? `${level.toUpperCase()}${number}`
        : null;
  }
}

function minutesUntil(timestamp) {
  if (!timestamp) return null;

  const seconds = Math.round(
    (timestamp * 1000 - Date.now()) / 1000
  );

  if (seconds < 0 || seconds > 60 * 60) {
    return null;
  }

  if (seconds < 60) {
    return `${Math.max(0, seconds)}s`;
  }

  return `${Math.ceil(seconds / 60)}m`;
}

export default function TeamPill({
  team,
  status,
  teamCount,
  nextMatch,
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!nextMatch?.predicted_time) {
      return;
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [nextMatch?.predicted_time]);

  const summary = teamStatusSummary(status, teamCount);

  const countdown = nextMatch?.predicted_time
    ? minutesUntil(nextMatch.predicted_time)
    : null;

  void now;

  return (
    <div className="pointer-events-auto flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-neutral-950/90 px-2 shadow-lg backdrop-blur">
      <span className="font-mono text-[11px] font-bold text-white">
        {teamNumber(team)}
      </span>

      <span className="font-mono text-[9px] text-neutral-400">
        {summary.record}
      </span>

      <span className="font-mono text-[9px] text-neutral-500">
        {summary.rank}
      </span>

      {nextMatch && (
        <>
          <span className="h-3 w-px bg-white/10" />

          <span className="font-mono text-[10px] font-bold text-white">
            {compactNextMatch(nextMatch)}
          </span>

          {countdown && (
            <span
              className={[
                "font-mono text-[9px] tabular-nums",
                countdown === "0s"
                  ? "font-bold text-white"
                  : "text-neutral-400",
              ].join(" ")}
            >
              {countdown}
            </span>
          )}
        </>
      )}
    </div>
  );
}