export function getNextMatch(matches: any[]) {
  const safeTime = (m: any) =>
    m.predicted_time ?? m.time ?? 0;

  return (
    matches
      .filter((m) => m.actual_time === null)
      .sort((a, b) => safeTime(a) - safeTime(b))[0] ?? null
  );
}