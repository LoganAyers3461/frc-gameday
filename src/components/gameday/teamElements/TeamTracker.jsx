"use client";

import TeamPill from "./TeamPill";

export default function TeamTracker({
  teams,
  teamsStatuses,
  teamCount,
  nextMatches,
  position = "sides",
}) {
  if (!teams?.length) {
    return null;
  }

  const renderPill = (team) => (
    <TeamPill
      key={team}
      team={team}
      status={teamsStatuses?.[team]}
      teamCount={teamCount}
      nextMatch={nextMatches?.[team]}
    />
  );

  if (position === "bottom") {
    return (
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-40 flex justify-center">
        <div className="pointer-events-auto flex max-w-[calc(100%-1rem)] min-w-0 gap-1 overflow-x-auto overflow-y-hidden px-1 no-scrollbar">
          {teams.map(renderPill)}
        </div>
      </div>
    );
  }

  if (position === "top") {
    return (
      <div className="pointer-events-none absolute top-2 left-0 right-0 z-40 flex justify-center">
        <div className="pointer-events-auto flex max-w-[calc(100%-1rem)] min-w-0 gap-1 overflow-x-auto overflow-y-hidden px-1 no-scrollbar">
          {teams.map(renderPill)}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-40">
      <div className="absolute left-2 top-1/2 flex max-w-[calc(50%-1rem)] -translate-y-1/2 flex-col gap-1">
        {teams
          .filter((_, index) => index % 2 === 0)
          .map(renderPill)}
      </div>

      <div className="absolute right-2 top-1/2 flex max-w-[calc(50%-1rem)] -translate-y-1/2 flex-col items-end gap-1">
        {teams
          .filter((_, index) => index % 2 === 1)
          .map(renderPill)}
      </div>
    </div>
  );
}