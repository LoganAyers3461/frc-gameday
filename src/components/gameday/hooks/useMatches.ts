import { useEffect, useState, useMemo, useCallback, useRef } from "react";

export function useMatches(eventKey: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);

  const hotRef = useRef<NodeJS.Timeout | null>(null);
  const coldRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  /* -------------------------- */
  /* COLD PATH (FULL MATCHES)   */
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
  /* HOT PATH (NEXT MATCH)     */
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
      console.error("Next match fetch failed:", err);
      return null;
    }
  }, [eventKey]);

  /* -------------------------- */
  /* HOT LOOP (3–5s ALWAYS)     */
  /* -------------------------- */

  const startHotLoop = useCallback(() => {
    const loop = async () => {
      if (cancelledRef.current) return;

      await loadNextMatch();

      hotRef.current = setTimeout(loop, 3000); // 🔥 3s fixed
    };

    loop();
  }, [loadNextMatch]);

  /* -------------------------- */
  /* COLD LOOP (SLOW REFRESH)   */
  /* -------------------------- */

  const startColdLoop = useCallback(() => {
    const loop = async () => {
      if (cancelledRef.current) return;

      await loadMatches();

      coldRef.current = setTimeout(loop, 120000); // 2 min
    };

    loop();
  }, [loadMatches]);

  /* -------------------------- */
  /* LIFECYCLE                  */
  /* -------------------------- */

  useEffect(() => {
    cancelledRef.current = false;

    startHotLoop();
    startColdLoop();

    return () => {
      cancelledRef.current = true;

      if (hotRef.current) clearTimeout(hotRef.current);
      if (coldRef.current) clearTimeout(coldRef.current);
    };
  }, [startHotLoop, startColdLoop]);

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