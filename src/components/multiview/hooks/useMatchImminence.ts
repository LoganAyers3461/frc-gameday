"use client";

import { useEffect } from "react";

export function useMatchImminence(match: any, emit: (signal: any) => void) {
  useEffect(() => {
    if (!match?.predicted_time) return;
    const update = () => {
      const diff = match.predicted_time * 1000 - Date.now();
      if (diff <= 120000 && diff > -60000) emit({ type: "match_imminent", matchKey: match.key, severity: diff <= 60000 ? "hard" : "soft" });
    };
    update();
    const id = window.setInterval(update, 10000);
    return () => window.clearInterval(id);
  }, [emit, match?.key, match?.predicted_time]);
}
