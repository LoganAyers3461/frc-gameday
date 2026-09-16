"use client";

import { useCallback, useEffect, useState } from "react";
import { usePolling } from "./usePolling";

type TeamStatuses = Record<string, any>;

export function useTeamsStatuses(eventKey: string) {
  const [teamsStatuses, setTeamsStatuses] = useState<TeamStatuses>({});
  const [loading, setLoading] = useState(Boolean(eventKey));

  const load = useCallback(async () => {
    if (!eventKey) return;
    try {
      const res = await fetch(`/api/event/${eventKey}/teams/statuses`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTeamsStatuses(json?.teams ?? json ?? {});
    } catch (error) {
      console.error("useTeamsStatuses:", error);
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  const reload = usePolling(load, "intermediate", { enabled: Boolean(eventKey), resetKey: eventKey });

  useEffect(() => { setTeamsStatuses({}); setLoading(Boolean(eventKey)); }, [eventKey]);

  return { teamsStatuses, loading, reload };
}
