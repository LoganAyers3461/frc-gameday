"use client";

import Record from "@/components/gameday/teamElements/Record";
import LastMatch from "@/components/gameday/teamElements/LastMatch";
import NextMatch from "@/components/gameday/teamElements/NextMatch";
import MatchStrip from "@/components/gameday/navbar/MatchStrip";
import EventInfo from "@/components/gameday/navbar/EventInfo";
import Rank from "@/components/gameday/teamElements/Rank";
import EventLocalTime from "@/components/gameday/navbar/EventLocalTime";

export default function GamedayBottomBar({ data, teamInput }) {
  const { event, team, nextMatch, lastMatch, matches, teamView } = data;
  //console.log("GamedayBottomBar render with:", { event, team, nextMatch, lastMatch, matches});
  return (
    <div className="flex flex-row gap-2 p-2 h-full">
      <div className="flex-1 flex-col items-center text-nowrap">
        { teamView.enabled ? <div className="text-xs text-white-800">{team.key.replace("frc", "Team ") || ""} At</div> : null }
        <EventInfo event={event} />
        { teamView.enabled ? <div className="flex flex-row text-nowrap pt-0 [@media(hover:none)_and_(pointer:coarse)]:text-xs"><Rank status={team.status}  team={team} /> <Record status={team.status} /></div> : null }
        <div className="[@media(hover:none)_and_(pointer:coarse)]:hidden">
          <EventLocalTime timezone={data.event.timezone} />
        </div>
      </div>
      
      {teamView.enabled ? <LastMatch match={lastMatch} team={team} /> : null}

      {teamView.enabled ? <NextMatch match={nextMatch} team={team} /> : null}
      
      <div className="flex flex-row text-nowrap pt-0 [@media(hover:none)_and_(pointer:coarse)]:hidden">
        <MatchStrip matches={matches} team={team} nextMatchKey={nextMatch.key ?? null} teamView={teamView} eventTimezone={data.event.timezone} />
      </div>
    </div>
  );
}