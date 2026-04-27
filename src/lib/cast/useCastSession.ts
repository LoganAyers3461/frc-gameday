import { useState } from "react";
import { startCastSession, sendCastState } from "./castClient";

export function useCastSession(buildState: () => any) {
  const [connected, setConnected] = useState(false);

  async function start() {
    await startCastSession();
    setConnected(true);

    sendCastState(buildState());
  }

  return { start, connected };
}