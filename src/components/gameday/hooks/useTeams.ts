"use client";

import { useEffect, useState } from "react";

export function useTeams(eventKey: string) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventKey) {
      setTeams([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/event/${eventKey}/teams`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Teams request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setTeams(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("useTeams error:", error);
          setTeams([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [eventKey]);

  return { teams, loading };
}
