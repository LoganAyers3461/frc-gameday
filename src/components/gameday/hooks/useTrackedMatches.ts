"use client";

import { useMemo } from "react";
import { getLastMatch, getMatchesForTeams, getNextMatch } from "@/lib/gameday/matchUtils";

export function useTrackedMatches(matches: any[], trackedTeams: string[]) {
  const trackedMatches = useMemo(() => getMatchesForTeams(matches, trackedTeams), [matches, trackedTeams]);
  const trackedNextMatch = useMemo(() => getNextMatch(trackedMatches), [trackedMatches]);
  const trackedLastMatch = useMemo(() => getLastMatch(trackedMatches), [trackedMatches]);
  const trackedNextMatches = useMemo(() => {
    const result: Record<string, any> = {};
    for (const team of trackedTeams) {
      result[team] = getNextMatch(getMatchesForTeams(matches, [team]));
    }
    return result;
  }, [matches, trackedTeams]);
  return { trackedMatches, trackedNextMatch, trackedLastMatch, trackedNextMatches };
}
