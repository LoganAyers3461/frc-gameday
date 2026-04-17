"use client";

import Record from "@/components/gameday/teamElements/Record";
import LastMatch from "@/components/gameday/teamElements/LastMatch";
import NextMatch from "@/components/gameday/teamElements/NextMatch";
import MatchStrip from "@/components/gameday/navbar/MatchStrip";
import EventInfo from "@/components/gameday/navbar/EventInfo";

export default function GamedayBottomBar({ data, team }) {
  const { event, teamStatus, nextMatch, lastMatch, matches, teamView } = data;
  console.log("GamedayBottomBar render with:", { event, teamStatus, nextMatch, lastMatch, matches});
  return (
    <div className="flex flex-row gap-2 p-2 h-full">
      <div className="flex-1 flex-col items-center gap-4">
        <EventInfo event={event} />

        <Record status={team} />
      </div>
      <LastMatch match={lastMatch} team={team} />

      <NextMatch match={nextMatch} team={team} />

      <MatchStrip matches={matches} team={team} teamView={teamView} />
    </div>
  );
}