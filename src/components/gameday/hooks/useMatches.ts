"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getRefreshDelay(nextMatch: any) {
  if (!nextMatch?.predicted_time) return 15000;

  const diff = nextMatch.predicted_time * 1000 - Date.now();
  if (diff < 60_000) return 2000;
  if (diff < 5 * 60_000) return 5000;
  return 30000;
}

function isSameMatch(a: any, b: any) {
  if (!a || !b) return a === b;
  return a.key === b.key && a.actual_time === b.actual_time && a.predicted_time === b.predicted_time;
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function useMatches(eventKey: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [eventNextMatch, setEventNextMatch] = useState<any>(null);
  const [eventLastMatch, setEventLastMatch] = useState<any>(null);

  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rebuildRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  const prevNextRef = useRef<any>(null);
  const prevLastRef = useRef<any>(null);

  const fetchAllMatches = useCallback(async () => {
    if (!eventKey || cancelledRef.current) return;
    try {
      const res = await fetch(`/api/event/${eventKey}/matches`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const incoming = (await readJson(res)) ?? [];
      if (cancelledRef.current) return;
      setMatches(Array.isArray(incoming) ? [...incoming].sort((a, b) => (a.predicted_time ?? Infinity) - (b.predicted_time ?? Infinity)) : []);
    } catch (error) {
      console.error(`[useMatches] Full match fetch failed for ${eventKey}`, error);
    }
  }, [eventKey]);

  const fetchNextMatch = useCallback(async () => {
    if (!eventKey || cancelledRef.current) return;
    try {
      const res = await fetch(`/api/event/${eventKey}/matches/next`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nextMatch = (await readJson(res)) ?? null;
      if (cancelledRef.current) return;

      if (!isSameMatch(prevNextRef.current, nextMatch)) {
        prevNextRef.current = nextMatch;
        setEventNextMatch(nextMatch);
        console.log(nextMatch ? "[useMatches] Next match changed" : "[useMatches] No next match");
      }

      nextTimeoutRef.current = setTimeout(fetchNextMatch, getRefreshDelay(nextMatch));
    } catch (error) {
      console.error("[useMatches] Next match polling error", error);
      if (!cancelledRef.current) nextTimeoutRef.current = setTimeout(fetchNextMatch, 15000);
    }
  }, [eventKey]);

  const fetchLastMatch = useCallback(async () => {
    if (!eventKey || cancelledRef.current) return;
    try {
      const res = await fetch(`/api/event/${eventKey}/matches/last`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lastMatch = (await readJson(res)) ?? null;
      if (cancelledRef.current) return;

      if (!isSameMatch(prevLastRef.current, lastMatch)) {
        prevLastRef.current = lastMatch;
        setEventLastMatch(lastMatch);
        console.log(lastMatch ? "[useMatches] Last match changed" : "[useMatches] No last match");
      }

      lastTimeoutRef.current = setTimeout(fetchLastMatch, 5000);
    } catch (error) {
      console.error("[useMatches] Last match polling error", error);
      if (!cancelledRef.current) lastTimeoutRef.current = setTimeout(fetchLastMatch, 15000);
    }
  }, [eventKey]);

  const reload = useCallback(() => {
    void fetchAllMatches();
  }, [fetchAllMatches]);

  useEffect(() => {
    if (!eventKey) return;
    cancelledRef.current = false;
    prevNextRef.current = null;
    prevLastRef.current = null;
    setMatches([]);
    setEventNextMatch(null);
    setEventLastMatch(null);

    void fetchAllMatches();
    void fetchNextMatch();
    void fetchLastMatch();

    const rebuild = () => {
      void fetchAllMatches();
      if (!cancelledRef.current) rebuildRef.current = setTimeout(rebuild, 3 * 60 * 1000);
    };
    rebuildRef.current = setTimeout(rebuild, 3 * 60 * 1000);

    return () => {
      cancelledRef.current = true;
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (lastTimeoutRef.current) clearTimeout(lastTimeoutRef.current);
      if (rebuildRef.current) clearTimeout(rebuildRef.current);
      nextTimeoutRef.current = null;
      lastTimeoutRef.current = null;
      rebuildRef.current = null;
    };
  }, [eventKey, fetchAllMatches, fetchNextMatch, fetchLastMatch]);

  return { matches, eventNextMatch, eventLastMatch, reload };
}
