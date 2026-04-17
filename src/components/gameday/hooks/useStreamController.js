"use client";

import { useEffect, useMemo, useState } from "react";

function makeKey(s) {
  return `${s.type}:${s.channel}`;
}

export function useStreamController(streams = []) {
  const normalized = useMemo(() => {
    return (streams || [])
      .filter(s => s?.channel && s?.type)
      .map(s => ({
        ...s,
        key: makeKey(s),
      }));
  }, [streams]);

  const [activeKey, setActiveKey] = useState(null);

  // Auto-select first valid stream
  useEffect(() => {
    if (!normalized.length) return;
    setActiveKey((prev) => prev ?? normalized[0].key);
  }, [normalized]);

  const activeStream = normalized.find(s => s.key === activeKey);

  return {
    streams: normalized,
    activeStream,
    activeKey,
    setActiveKey,
  };
}