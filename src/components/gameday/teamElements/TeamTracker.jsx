"use client";

import TeamPill from "./TeamPill";

export default function TeamTracker({
  teams = [],
  teamsStatuses = {},
  teamCount,
  nextMatches = {},
  position = "sides",
}) {
  if (!teams.length || position === "hidden") {
    return null;
  }

  const pills = teams.map((team) => (
    <TeamPill
      key={team}
      team={team}
      status={teamsStatuses[team]}
      teamCount={teamCount}
      nextMatch={nextMatches[team]}
      presentation="visible"
    />
  ));

  if (position === "top" || position === "bottom") {
    return (
      <div
        className={`pointer-events-none absolute ${position}-2 left-0 right-0 z-40 flex justify-center`}
      >
        <div className="pointer-events-auto flex max-w-[calc(100%-1rem)] gap-1 overflow-x-auto px-1 no-scrollbar">
          {pills}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="absolute left-2 top-1/2 flex -translate-y-1/2 flex-col gap-1">
        {pills.filter((_, index) => index % 2 === 0)}
      </div>

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-end gap-1">
        {pills.filter((_, index) => index % 2 === 1)}
      </div>
    </div>
  );
}