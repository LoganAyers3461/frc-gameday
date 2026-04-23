export function getLastMatch(matches: any[]) {
  return (
    matches
      .filter((m) => m.actual_time != null)
      .sort((a, b) => (b.actual_time ?? 0) - (a.actual_time ?? 0))[0] ?? null
  );
}