"use client";

import { useEffect, useState } from "react";
import type { TBAMatch } from "@/lib/tba/types";

type NextMatchCountdownProps = {
  nextMatch: TBAMatch;
};

export default function NextMatchCountdown({
  nextMatch,
}: NextMatchCountdownProps) {
  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(id);
  }, []);

  if (nextMatch.predicted_time == null) {
    return null;
  }

  const seconds = Math.max(
    0,
    Math.round(nextMatch.predicted_time - Date.now() / 1_000)
  );

  const text =
    seconds < 60
      ? `${seconds}s`
      : `${Math.ceil(seconds / 60)}m`;

  return <span className="tabular-nums">{text}</span>;
}