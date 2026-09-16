"use client";

import NextMatchCountdown from "./NextMatchCountdown";
import { formatAlliance } from "@/lib/tbaFormatters";
import { formatEventTime } from "@/lib/time";

function compactMatchName(match) {
  if (!match) return "";

  const level = match.comp_level?.toLowerCase() || "";
  const number = match.match_number ?? "";
  const set = match.set_number;

  switch (level) {
    case "qm":
      return `Qual ${number}`;

    case "ef":
      return set != null
        ? `EF${set}-${number}`
        : `EF${number}`;

    case "qf":
      return set != null
        ? `QF${set}-${number}`
        : `QF${number}`;

    case "sf":
      return set != null
        ? `SF${set}-${number}`
        : `SF${number}`;

    case "f":
      return `Final ${number}`;

    default:
      return `${level.toUpperCase()}${number}`;
  }
}

export default function MatchCard({
  match,
  team = [],
  isNext = false,
  isLast = false,
  playoffAlliances = [],
  eventTimezone,
}) {
  if (!match) return null;

  const red = match?.alliances?.red?.team_keys || [];
  const blue = match?.alliances?.blue?.team_keys || [];

  const trackedRed = red.some((key) => team.includes(key));
  const trackedBlue = blue.some((key) => team.includes(key));

  const isPlayoff = match.comp_level !== "qm";

  const redAlliance = isPlayoff
    ? playoffAlliances.find((alliance) =>
        alliance?.picks?.some((pick) => red.includes(pick))
      )
    : null;

  const blueAlliance = isPlayoff
    ? playoffAlliances.find((alliance) =>
        alliance?.picks?.some((pick) => blue.includes(pick))
      )
    : null;

  const matchName = compactMatchName(match);

  return (
    <article
      className={[
        "shrink-0 min-w-[168px] max-w-[168px]",
        "rounded-lg border px-2 py-1.5",
        "transition",
        isNext
          ? "border-white bg-white text-black"
          : isLast
            ? "border-neutral-600 bg-neutral-800"
            : "border-neutral-800 bg-neutral-900",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wide">
          {matchName}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`font-mono text-[10px] tabular-nums ${
              isNext
                ? "font-bold"
                : "opacity-60"
            }`}
          >
            {isNext && match.predicted_time ? (
              <NextMatchCountdown nextMatch={match} />
            ) : match.predicted_time ? (
              formatEventTime(match.predicted_time, eventTimezone)
            ) : (
              "TBD"
            )}
          </span>

          {isNext && (
            <span className="rounded bg-black px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white">
              NEXT
            </span>
          )}

          {isLast && !isNext && (
            <span className="text-[8px] font-semibold uppercase opacity-50">
              LAST
            </span>
          )}
        </div>
      </div>

      {/* Alliances */}
      <div className="mt-1.5 space-y-0.5">
        <div
          className={`flex items-center justify-between gap-1 ${
            trackedRed ? "font-bold" : ""
          }`}
        >
          <span className="min-w-0 truncate text-[11px] text-red-400">
            {redAlliance
              ? `${redAlliance.name?.replace("Alliance ", "A")} `
              : ""}
            {formatAlliance(red, team)}
          </span>

          {match.alliances?.red?.score != null && (
            <span className="shrink-0 font-mono text-[11px] font-bold text-red-300">
              {match.alliances.red.score}
            </span>
          )}
        </div>

        <div
          className={`flex items-center justify-between gap-1 ${
            trackedBlue ? "font-bold" : ""
          }`}
        >
          <span className="min-w-0 truncate text-[11px] text-blue-400">
            {blueAlliance
              ? `${blueAlliance.name?.replace("Alliance ", "A")} `
              : ""}
            {formatAlliance(blue, team)}
          </span>

          {match.alliances?.blue?.score != null && (
            <span className="shrink-0 font-mono text-[11px] font-bold text-blue-300">
              {match.alliances.blue.score}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}