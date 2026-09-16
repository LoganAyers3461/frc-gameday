"use client";

import { useMemo } from "react";

function getMatchTeams(match: any): string[] {
  const red = match?.alliances?.red?.team_keys || [];
  const blue = match?.alliances?.blue?.team_keys || [];

  return [...red, ...blue].filter(Boolean);
}

export function useTrackedMatches(
  matches: any[],
  trackedTeams: string[] = []
) {
  const trackedMatches = useMemo(() => {
    if (!trackedTeams.length) {
      return matches;
    }

    return matches.filter((match) => {
      const teams = getMatchTeams(match);

      return teams.some((team) =>
        trackedTeams.includes(team)
      );
    });
  }, [matches, trackedTeams]);

  const trackedNextMatch = useMemo(() => {
    if (!trackedTeams.length) {
      return null;
    }

    return (
      trackedMatches.find(
        (match) => match.actual_time == null
      ) ?? null
    );
  }, [trackedMatches, trackedTeams]);

  const trackedLastMatch = useMemo(() => {
    if (!trackedTeams.length) {
      return null;
    }

    let last = null;

    for (const match of trackedMatches) {
      if (match.actual_time == null) {
        continue;
      }

      if (
        !last ||
        match.actual_time > last.actual_time
      ) {
        last = match;
      }
    }

    return last;
  }, [trackedMatches, trackedTeams]);

  return {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
  };
}