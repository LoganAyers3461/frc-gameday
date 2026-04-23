export function getMatchesForTeams(matches: any[], teams: string[]) {
  if (!teams?.length) return [];

  return matches.filter((m) =>
    teams.some(
      (team) =>
        m.alliances.red.team_keys.includes(team) ||
        m.alliances.blue.team_keys.includes(team)
    )
  );
}