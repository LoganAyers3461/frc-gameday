"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePolling } from "./usePolling";

function readJson(response: Response) {
  return response.text().then((text) => {
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  });
}

function sortMatches(matches: any[]) {
  return [...matches].sort(
    (a, b) =>
      (a.predicted_time ?? Infinity) -
      (b.predicted_time ?? Infinity)
  );
}

function isPlayed(match: any) {
  return Boolean(match?.actual_time);
}

function getNextMatch(matches: any[]) {
  const now = Date.now();

  return (
    matches.find((match) => {
      if (isPlayed(match)) return false;

      if (!match?.predicted_time) return true;

      return match.predicted_time * 1000 >= now;
    }) ?? null
  );
}

function getLastMatch(matches: any[]) {
  let lastMatch = null;

  for (const match of matches) {
    if (!isPlayed(match)) continue;

    if (
      !lastMatch ||
      (match.actual_time ?? 0) >
        (lastMatch.actual_time ?? 0)
    ) {
      lastMatch = match;
    }
  }

  return lastMatch;
}

export function useMatches(eventKey: string) {
  const [matches, setMatches] = useState<any[]>([]);

  const fetchMatches = useCallback(async () => {
    if (!eventKey) return;

    try {
      const res = await fetch(
        `/api/event/${eventKey}/matches`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const incoming = (await readJson(res)) ?? [];

      setMatches(
        Array.isArray(incoming)
          ? sortMatches(incoming)
          : []
      );
    } catch (error) {
      console.error(
        `[useMatches] Match fetch failed for ${eventKey}`,
        error
      );
    }
  }, [eventKey]);

  const { poll: reload } = usePolling(
    fetchMatches,
    "fast",
    {
      enabled: Boolean(eventKey),
      resetKey: eventKey,
    }
  );

  useEffect(() => {
    setMatches([]);
  }, [eventKey]);

  const eventNextMatch = useMemo(
    () => getNextMatch(matches),
    [matches]
  );

  const eventLastMatch = useMemo(
    () => getLastMatch(matches),
    [matches]
  );

  return {
    matches,
    eventNextMatch,
    eventLastMatch,
    reload,
  };
}
