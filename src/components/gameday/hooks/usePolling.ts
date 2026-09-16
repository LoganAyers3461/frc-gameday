"use client";

import { useCallback, useEffect, useRef } from "react";

export const POLLING_INTERVALS = {
  realtime: 1_000,
  fast: 5_000,
  intermediate: 3 * 60_000,
  long: 60 * 60_000,
} as const;

export type PollingTier = keyof typeof POLLING_INTERVALS;

export interface UsePollingOptions {
  enabled?: boolean;
  resetKey?: string | null;
}

/**
 * Run a callback on one of the application's standard polling cadences.
 *
 * The callback runs immediately, then on the selected interval.
 *
 * Scheduling is intentionally kept separate from the callback itself:
 * usePolling knows nothing about what is being fetched or how the result
 * is stored.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  tier: PollingTier,
  {
    enabled = true,
    resetKey = null,
  }: UsePollingOptions = {}
) {
  const callbackRef = useRef(callback);
  const inFlightRef = useRef(false);

  callbackRef.current = callback;

  const poll = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    try {
      await callbackRef.current();
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interval = POLLING_INTERVALS[tier];

    void poll();

    const timer = window.setInterval(() => {
      void poll();
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, tier, resetKey, poll]);

  return {
    poll,
  };
}
