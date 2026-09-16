"use client";

export default function GamedayEventTeamInfo({ team = [] }) {
  if (!team.length) {
    return (
      <div className="px-2">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          Tracking: All Teams
        </span>
      </div>
    );
  }

  if (team.length === 1) {
    return (
      <div className="px-2">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          Team {team[0].replace("frc", "")}
        </span>
      </div>
    );
  }

  return (
    <div className="px-2">
      <span className="block truncate text-xs font-semibold text-white">
        Tracking Teams: {" "}
        {team
          .map((key) => key.replace("frc", ""))
          .join(", ")}
      </span>
    </div>
  );
}