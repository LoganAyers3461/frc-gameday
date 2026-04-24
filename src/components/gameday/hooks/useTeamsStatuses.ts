import { useEffect, useState, useCallback } from "react";

export function useTeamsStatuses(eventKey: string) {
  const [teamsStatuses, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const REFRESH_MS = 20 * 1000;

  const load = useCallback(async () => {
    if (!eventKey) return;

    try {
      const res = await fetch(`/api/event/${eventKey}/teams/statuses`);
      const json = await res.json();

      setTeams(json.teams ?? json);
    } catch (err) {
      console.error("useTeamsStatuses error:", err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  useEffect(() => {
    if (!eventKey) return;

    let intervalId: NodeJS.Timeout;

    load();
    intervalId = setInterval(load, REFRESH_MS);

    return () => clearInterval(intervalId);
  }, [load]);

  return {
    teamsStatuses,
    loading,
    reload: load,
  };
}