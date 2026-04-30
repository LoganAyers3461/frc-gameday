import { useEffect, useState, useMemo, useCallback, useRef } from "react";

function getAdaptiveInterval(nextMatch?: any) {
  const now = Date.now() / 1000;

  if (!nextMatch?.predicted_time) return 180_000;

  const secondsUntilMatch = nextMatch.predicted_time - now;

  if (secondsUntilMatch < 120) return 10_000;
  if (secondsUntilMatch < 300) return 30_000;

  return 180_000;
}

export function useMatches(eventKey: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  /* -------------------------- */
  /* FULL MATCH LIST            */
  /* -------------------------- */

  const loadMatches = useCallback(async () => {
    if (!eventKey || cancelledRef.current) return [];

    try {
      const res = await fetch(`/api/event/${eventKey}/matches`);
      if (!res.ok) throw new Error("Matches fetch failed");

      const json = await res.json();

      const sorted = (json || []).sort(
        (a: any, b: any) =>
          (a.predicted_time || 0) - (b.predicted_time || 0)
      );

      setMatches(sorted);
      return sorted;
    } catch (err) {
      console.error("useMatches error:", err);
      setMatches([]);
      return [];
    }
  }, [eventKey]);

  /* -------------------------- */
  /* HOT PATH: NEXT MATCH       */
  /* -------------------------- */

  const loadNextMatch = useCallback(async () => {
    if (!eventKey || cancelledRef.current) return null;

    try {
      const res = await fetch(`/api/event/${eventKey}/matches/next`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Next match fetch failed");

      const json = await res.json();

      setNextMatch(json?.next ?? null);

      return json?.next ?? null;
    } catch (err) {
      console.error("Failed to fetch next match:", err);
      setNextMatch(null);
      return null;
    }
  }, [eventKey]);

  /* -------------------------- */
  /* ADAPTIVE LOOP              */
  /* -------------------------- */

  const scheduleNext = useCallback(async () => {
    if (cancelledRef.current) return;

    // 🔥 run both in parallel (fast + accurate)
    const [latestMatches, latestNext] = await Promise.all([
      loadMatches(),
      loadNextMatch(),
    ]);

    const next =
      latestNext ??
      latestMatches.find((m: any) => m.actual_time === null) ??
      null;

    const delay = getAdaptiveInterval(next);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      scheduleNext();
    }, delay);

    console.log(eventKey, "[useMatches] Next match refresh in:", delay);
  }, [loadMatches, loadNextMatch, eventKey]);

  /* -------------------------- */
  /* LIFECYCLE                  */
  /* -------------------------- */

  useEffect(() => {
    cancelledRef.current = false;

    scheduleNext();

    return () => {
      cancelledRef.current = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleNext]);

  /* -------------------------- */
  /* DERIVATIONS                */
  /* -------------------------- */

  const eventLastMatch = useMemo(() => {
    return [...matches]
      .reverse()
      .find((m: any) => m.actual_time !== null) || null;
  }, [matches]);

  return {
    matches,
    eventNextMatch: nextMatch,
    eventLastMatch,
    reload: loadMatches,
  };
}