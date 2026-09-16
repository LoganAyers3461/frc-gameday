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
  const trackedSet = useMemo(
    () => new Set(trackedTeams),
    [trackedTeams]
  );

  const trackedMatches = useMemo(() => {
    if (!trackedTeams.length) {
      return matches;
    }

    return matches.filter((match) => {
      const teams = getMatchTeams(match);

      return teams.some((team) => trackedSet.has(team));
    });
  }, [matches, trackedTeams, trackedSet]);

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

  const trackedNextMatches = useMemo(() => {
    const result: Record<string, any> = {};

    if (!trackedTeams.length) {
      return result;
    }

    for (const team of trackedTeams) {
      let next = null;

      for (const match of trackedMatches) {
        if (
          !match?.key ||
          !match?.predicted_time
        ) {
          continue;
        }

        if (match.actual_time != null) {
          continue;
        }

        if (!getMatchTeams(match).includes(team)) {
          continue;
        }

        if (
          match.predicted_time * 1000 <
          Date.now() - 60_000
        ) {
          continue;
        }

        if (
          !next ||
          (match.predicted_time ?? Infinity) <
            (next.predicted_time ?? Infinity)
        ) {
          next = match;
        }
      }

      result[team] = next;
    }

    return result;
  }, [trackedMatches, trackedTeams]);

  return {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
    trackedNextMatches,
  };
}