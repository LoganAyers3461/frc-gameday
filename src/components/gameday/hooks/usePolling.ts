"use client";

import { useCallback, useEffect, useRef } from "react";

export const POLLING_INTERVALS = {
  realtime: 1_000,
  fast: 5_000,
  intermediate: 3 * 60_000,
  long: 60 * 60_000,
} as const;

export type PollingTier = keyof typeof POLLING_INTERVALS;

export function usePolling(
  callback: () => void | Promise<void>,
  tier: PollingTier,
  options: { enabled?: boolean; resetKey?: string | null } = {},
) {
  const { enabled = true, resetKey = null } = options;
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);
  callbackRef.current = callback;

  const poll = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      await callbackRef.current();
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void poll();
    const id = window.setInterval(() => void poll(), POLLING_INTERVALS[tier]);
    return () => window.clearInterval(id);
  }, [enabled, poll, resetKey, tier]);

  return poll;
}
