"use client";

import { useEffect, useState } from "react";

export function useEvent(eventKey: string) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventKey) {
      setEvent(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/event/${eventKey}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Event request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setEvent(data ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setEvent(null);
          setError(err instanceof Error ? err : new Error("Event request failed"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [eventKey]);

  return { event, loading, error };
}
