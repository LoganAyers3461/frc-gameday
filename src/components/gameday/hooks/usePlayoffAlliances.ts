"use client";

import { useCallback, useEffect, useState } from "react";
import { usePolling } from "./usePolling";

export function usePlayoffAlliances(eventKey: string) {
  const [alliances, setAlliances] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!eventKey) return;

    try {
      const res = await fetch(
        `/api/event/${eventKey}/playoffs/alliances`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Alliances request failed: ${res.status}`
        );
      }

      const json = await res.json();

      setAlliances(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("usePlayoffAlliances error:", err);
      setAlliances([]);
    }
  }, [eventKey]);

  const { poll: reload } = usePolling(
    load,
    "intermediate",
    {
      enabled: Boolean(eventKey),
      resetKey: eventKey,
    }
  );

  useEffect(() => {
    setAlliances([]);
  }, [eventKey]);

  return {
    alliances,
    reload,
  };
}
