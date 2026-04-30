"use client";

import Record from "@/components/gameday/teamElements/Record";
import Rank from "@/components/gameday/teamElements/Rank";
import EventInfo from "@/components/gameday/navbar/EventInfo";
import EventLocalTime from "@/components/gameday/navbar/EventLocalTime";
import { useMemo } from "react";

export default function GamedayEventTeamInfo({ event, team: teamKey, teamStatus, nextMatch, lastMatch, isDivisional }) {
  const isTeamMode = teamKey.length > 0 && teamStatus;
  const activeDisplayTeam = useMemo(() => {
    if (!teamKey?.length || (!nextMatch && !lastMatch)) return teamKey[0];

    const match = nextMatch || lastMatch

    const teamsInMatch = [
      ...(match?.alliances?.red?.team_keys || []),
      ...(match?.alliances?.blue?.team_keys || [])
    ];

    return teamKey.find(t => teamsInMatch.includes(t)) || teamKey[0];
  }, [teamKey, nextMatch, lastMatch]);
  //console.log(activeDisplayTeam)
  return (
    <div className="w-full h-full flex flex-row items-stretch gap-2 px-2 py-2 overflow-hidden">

      {/* LEFT */}
      <div className="flex flex-col justify-center shrink-0">
        {isTeamMode && (
          <div className="text-xs text-white">
            {/* {teamKey.map((t) => {return (<span key={t} className={activeDisplayTeam === t ? "font-bold underline gap-1" : "gap-1"}>{t.replace("frc", "FRC")} | </span>)})} At
             */}
            <span className="">Tracking {teamKey.length} Team(s) </span>
          </div>
        )}

        <EventInfo event={event} />

        {isTeamMode && (
          <div className="flex gap-1 text-nowrap text-sm">
            <span className="text-white">Team {activeDisplayTeam?.replace("frc", "")}</span>
            <Rank status={teamStatus[activeDisplayTeam]} />
            <Record status={teamStatus[activeDisplayTeam]} />
          </div>
        )}

        <div className={`text-xs text-gray-400 ${isTeamMode ? "[@media(hover:none)_and_(pointer:coarse)]:hidden" : ""}`}>
          {!isDivisional && <EventLocalTime timezone={event?.timezone} />}
        </div>
      </div>  
    </div>
  );
}