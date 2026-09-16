"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NexusData } from "@/lib/nexus/types";
import { usePolling } from "./usePolling";

export function useNexus(eventKey: string | null) {
  const [data, setData] = useState<NexusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const etag = useRef<string | null>(null);

  const fetchNexus = useCallback(async () => {
    if (!eventKey) return;

    try {
      const response = await fetch(`/api/event/${eventKey}/nexus`, {
        headers: etag.current
          ? { "If-None-Match": etag.current }
          : {},
        cache: "no-store",
      });

      if (response.status === 204 || response.status === 304) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Nexus request failed: ${response.status}`
        );
      }

      const next: NexusData = await response.json();

      etag.current = response.headers.get("etag");
      setData(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Unknown Nexus error")
      );
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  const { poll: refresh } = usePolling(
    fetchNexus,
    "realtime",
    {
      enabled: Boolean(eventKey),
      resetKey: eventKey,
    }
  );

  useEffect(() => {
    etag.current = null;
    setData(null);
    setError(null);
    setLoading(Boolean(eventKey));
  }, [eventKey]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
