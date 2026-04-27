"use client";

import { CastState } from "@/lib/cast/types";
import { startCastSession, sendCastState } from "@/lib/cast/castClient";

type Props = {
  buildState: () => CastState;
};

export default function CastButton({ buildState }: Props) {
  async function handleCast() {
    await startCastSession();

    const state = buildState();
    sendCastState(state);
  }

  return (
    <button onClick={handleCast} className="bg-blue-600 px-3 py-1 rounded">
      Cast Multiview
    </button>
  );
}