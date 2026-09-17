"use client";

import { useEffect, useRef } from "react";

export function useMatchImminence(
  match: any,
  emit: (signal: any) => void
) {
  const emitRef = useRef(emit);
  const imminentRef = useRef(false);

  useEffect(() => {
    emitRef.current = emit;
  }, [emit]);

  useEffect(() => {
    imminentRef.current = false;

    if (!match?.predicted_time) {
      return;
    }

    const update = () => {
      const diff =
        match.predicted_time * 1000 - Date.now();

      const imminent =
        diff <= 120000 && diff > -60000;

      /*
       * Emit only when the match enters the imminent window.
       *
       * Once emitted, the same match cannot repeatedly steal
       * focus every ten seconds.
       */
      if (
        imminent &&
        !imminentRef.current
      ) {
        emitRef.current({
          type: "match_imminent",
          matchKey: match.key,
          severity:
            diff <= 60000
              ? "hard"
              : "soft",
        });
      }

      imminentRef.current = imminent;
    };

    update();

    const interval =
      window.setInterval(
        update,
        10000
      );

    return () =>
      window.clearInterval(interval);
  }, [
    match?.key,
    match?.predicted_time,
  ]);
}