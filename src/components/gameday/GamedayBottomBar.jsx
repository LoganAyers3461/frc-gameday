"use client";

import Record from "@/components/gameday/teamElements/Record";
import LastMatch from "@/components/gameday/teamElements/LastMatch";
import NextMatch from "@/components/gameday/teamElements/NextMatch";
import MatchStrip from "@/components/gameday/navbar/MatchStrip";
import EventInfo from "@/components/gameday/navbar/EventInfo";
import Rank from "@/components/gameday/teamElements/Rank";

export default function GamedayBottomBar({ data, teamInput }) {
  const { event, team, nextMatch, lastMatch, matches, teamView } = data;
  console.log("GamedayBottomBar render with:", { event, team, nextMatch, lastMatch, matches});
  return (
    <div className="flex flex-row gap-2 p-2 h-full">
      <div className="flex-1 flex-col items-center gap-4 text-nowrap">
        { teamView.enabled ? <div className="text-md text-white-800">{team.key.replace("frc", "Team ") || ""} At</div> : null }
        <EventInfo event={event} />
        { teamView.enabled ? <div className="flex flex-row text-nowrap "><Rank status={team.status}  team={team} /> <Record status={team.status} /></div> : null }
      </div>

      {teamView.enabled ? <LastMatch match={lastMatch} team={team} /> : null}

      {teamView.enabled ? <NextMatch match={nextMatch} team={team} /> : null}

      <MatchStrip matches={matches} team={team} nextMatchKey={nextMatch.key} teamView={teamView} />
    </div>
  );
}