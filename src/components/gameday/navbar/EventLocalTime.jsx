"use client";

import { useEffect, useState } from "react";

function getEventNow(timezone) {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );
}

export default function EventLocalTime({ timezone }) {
  const [now, setNow] = useState(() => getEventNow(timezone));

  useEffect(() => {
    const id = setInterval(() => {
      setNow(getEventNow(timezone));
    }, 1000);

    return () => clearInterval(id);
  }, [timezone]);

  return (
    <div className="text-xs text-gray-300">
      <span className="text-gray-300 mr-2">Local:</span>
      <span className="font-mono">
        {now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}