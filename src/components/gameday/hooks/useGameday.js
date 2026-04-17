"use client";

import { useEffect, useState } from "react";

export function useGameday(event, team) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("EFFECT TRIGGERED with:", event);

    let cancelled = false;

    async function load() {
      if (!event) {
        console.log("Skipping fetch, no event yet");
        return;
      }

      try {
        setLoading(true);

        const url = team
          ? `/api/event/${event}/gameday?team=${team}`
          : `/api/event/${event}/gameday`;

        console.log("FETCHING:", url);

        const res = await fetch(url);
        const json = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [event, team]);

  return { data, loading, error };
}