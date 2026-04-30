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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  // 🔥 RETURN DATA
  const load = useCallback(async () => {
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
      return sorted; // 🔥 important
    } catch (err) {
      console.error("useMatches error:", err);
      setMatches([]);
      return [];
    }
  }, [eventKey]);

  const scheduleNext = useCallback(async () => {
    if (cancelledRef.current) return;

    const latestMatches = await load(); // 🔥 always fresh

    const nextMatch =
      latestMatches.find((m:any) => m.actual_time === null) || null;

    const delay = getAdaptiveInterval(nextMatch);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      scheduleNext(); // 🔥 recursive loop
    }, delay);

    console.log(eventKey, "[useMatches] Next match refresh in:", delay);
  }, [load, eventKey]);

  useEffect(() => {
    cancelledRef.current = false;

    scheduleNext(); // 🔥 start loop

    return () => {
      cancelledRef.current = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleNext]);

  /* -------------------------- */
  /* PURE DERIVATIONS           */
  /* -------------------------- */

  const eventNextMatch = useMemo(() => {
    return matches.find((m) => m.actual_time === null) || null;
  }, [matches]);

  const eventLastMatch = useMemo(() => {
    return [...matches]
      .reverse()
      .find((m) => m.actual_time !== null) || null;
  }, [matches]);

  return {
    matches,
    eventNextMatch,
    eventLastMatch,
    reload: load,
  };
}