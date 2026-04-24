import { useEffect, useState, useCallback } from "react";

export function usePlayoffAlliances(eventKey: string) {
  const [alliances, setAlliances] = useState([]);
  const REFRESH_MS = 3 * 60 * 1000;

  const load = useCallback(async () => {
    if (!eventKey) return;

    try {
      const res = await fetch(`/api/event/${eventKey}/playoffs/alliances`);
      if (!res.ok) throw new Error("Alliances fetch failed");

      const json = await res.json();
      setAlliances(json);
    } catch (err) {
      console.error("useAlliances error:", err);
      setAlliances([]);
    }
  }, [eventKey]);

  useEffect(() => {
    if (!eventKey) return;

    let cancelled = false;

    async function safeLoad() {
      if (cancelled) return;
      await load();
    }

    safeLoad();
    const intervalId = setInterval(safeLoad, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [load]);

  return {
    alliances,
    reload: load, // ✅ now works
  };
}