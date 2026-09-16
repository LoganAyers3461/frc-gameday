export function isPlayed(match: any) {
  return Boolean(match?.actual_time);
}

export function matchTime(match: any) {
  return match?.predicted_time ?? match?.time ?? Infinity;
}

export function sortMatches(matches: any[]) {
  return [...matches].sort((a, b) => matchTime(a) - matchTime(b));
}

export function getNextMatch(matches: any[]) {
  const now = Date.now() / 1000;
  return matches.find((match) => !isPlayed(match) && matchTime(match) >= now) ??
    matches.find((match) => !isPlayed(match)) ?? null;
}

export function getLastMatch(matches: any[]) {
  return matches.reduce((latest, match) => {
    if (!isPlayed(match)) return latest;
    if (!latest || (match.actual_time ?? 0) > (latest.actual_time ?? 0)) return match;
    return latest;
  }, null);
}

export function getMatchesForTeams(matches: any[], teams: string[]) {
  if (!teams.length) return matches;
  const wanted = new Set(teams.map(String));
  return matches.filter((match) =>
    [...(match.alliances?.red?.team_keys ?? []), ...(match.alliances?.blue?.team_keys ?? [])]
      .some((team) => wanted.has(String(team)))
  );
}

export function compactMatchLabel(match: any) {
  if (!match) return null;
  const level = String(match.comp_level ?? "").toLowerCase();
  const number = match.match_number ?? "";
  const set = match.set_number;
  if (level === "qm") return `Q${number}`;
  if (["ef", "qf", "sf"].includes(level)) return set != null ? `${level.toUpperCase()}${set}-${number}` : `${level.toUpperCase()}${number}`;
  if (level === "f") return `F${number}`;
  return level ? `${level.toUpperCase()}${number}` : null;
}
