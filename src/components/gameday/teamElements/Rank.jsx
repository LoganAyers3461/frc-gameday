"use client";

export default function TeamRank({ status, team }) {
  if (!status) {
    return (
      <div className="text-gray-400 text-sm">
        No Rank
      </div>
    );
  }

  const isPlayoffs = !!status?.playoff;
  const isQuals = !!status?.qual?.ranking;

  // ------------------------
  // QUALIFICATIONS
  // ------------------------
  if (isQuals) {
    const rank = status.qual?.ranking?.rank;
    const total = status.qual?.num_teams;

    return (
        <div className="font-semibold text-sm">
          <span className="text-white-300">Rank:</span> {rank ?? "?"} / {total ?? "?"}
        </div>
    );
  }

  // ------------------------
  // PLAYOFFS
  // ------------------------
  if (isPlayoffs) {
    const allianceName = status?.alliance?.name
      ? status.alliance.name.replace("Alliance", "A").replace(" ", "")
      : "";

    const round = status?.playoff?.double_elim_round
      ? status.playoff.double_elim_round
      : status?.playoff?.level
      ? status.playoff.level.toUpperCase()
      : "PLAYOFFS";

    const isEliminated = status?.playoff?.status === "eliminated";

    return (
      <div className="text-sm flex items-center gap-2">
        <span className="text-gray-400">Alliance:</span>

        <span className="font-semibold">
          {allianceName || "?"}
        </span>

        <span className="text-gray-500">|</span>

        {isEliminated ? (
          <span className="text-red-400 font-semibold">
            Eliminated
          </span>
        ) : (
          <span className="text-yellow-300 font-semibold">
            {round}
          </span>
        )}
      </div>
    );
  }

  // ------------------------
  // FALLBACK
  // ------------------------
  return (
    <div className="text-gray-400 text-sm">
      No Rank
    </div>
  );
}