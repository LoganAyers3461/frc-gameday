export function normalizeMatches(matches: any[], team?: string) {
  return (matches || [])
    .slice()
    .sort((a, b) => (a?.predicted_time || 0) - (b?.predicted_time || 0))
    .map((m) => {
      const isTeamMatch = team
        ? m.alliances.red.team_keys.includes(team) ||
          m.alliances.blue.team_keys.includes(team)
        : false;

      return {
        ...m,
        isTeamMatch,
      };
    });
}