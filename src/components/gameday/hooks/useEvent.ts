"use client";

import { useEffect, useState } from "react";

export function useEvent(eventKey: string) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(eventKey));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventKey) { setEvent(null); setLoading(false); setError(null); return; }
    const controller = new AbortController();
    setLoading(true); setError(null); setEvent(null);
    fetch(`/api/event/${eventKey}`, { cache: "no-store", signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(`Event request failed: ${res.status}`); return res.json(); })
      .then(setEvent)
      .catch((err) => { if (err.name !== "AbortError") { setError(err instanceof Error ? err : new Error("Event request failed")); setEvent(null); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [eventKey]);

  return { event, loading, error };
}
