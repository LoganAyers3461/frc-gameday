"use client";

import { useCallback, useEffect, useState } from "react";
import { usePolling } from "./usePolling";

export function useTeamsStatuses(eventKey: string) {
  const [teamsStatuses, setTeamsStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!eventKey) return;

    try {
      const res = await fetch(
        `/api/event/${eventKey}/teams/statuses`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setTeamsStatuses(json.teams ?? json);
    } catch (err) {
      console.error("useTeamsStatuses error:", err);
      setTeamsStatuses([]);
    } finally {
      setLoading(false);
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
    setTeamsStatuses([]);
    setLoading(Boolean(eventKey));
  }, [eventKey]);

  return {
    teamsStatuses,
    loading,
    reload,
  };
}