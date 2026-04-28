"use client";

import { useCastSession } from "@/lib/cast/useCastSession";
import { sendCastMessage } from "@/lib/cast/castClient";

export default function CastButton() {
  const { state, startCast, endCast } = useCastSession();

  const handleClick = async () => {
    if (state === "connected") {
      endCast();
      return;
    }

    try {
      await startCast();

      // optional handshake message
      sendCastMessage("urn:x-cast:frc.multiview", {
        type: "init",
        source: "sender",
      });
    } catch (e) {
      console.error("Cast failed:", e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 bg-neutral-800 rounded hover:bg-neutral-700"
    >
      {state === "connected"
        ? "Stop Casting"
        : state === "connecting"
        ? "Connecting..."
        : "Send via Chromecast"}
    </button>
  );
}