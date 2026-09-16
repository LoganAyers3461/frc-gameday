"use client";

import { useEffect, useState } from "react";

function format(seconds) {
  if (seconds <= 0) return "NOW";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) return `${String(Math.floor(mins / 60)).padStart(2, "0")}h ${String(mins % 60).padStart(2, "0")}m`;
  return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

export default function NextMatchCountdown({ nextMatch }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!nextMatch?.predicted_time) {
      setRemaining(null);
      return;
    }
    const update = () => setRemaining(Math.floor(nextMatch.predicted_time - Date.now() / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextMatch?.predicted_time]);

  if (!nextMatch) return "No upcoming match";
  if (remaining == null) return "Time TBD";
  return format(remaining);
}
