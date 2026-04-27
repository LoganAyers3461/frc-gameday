"use client";

import { useState } from "react";
import { sendCastState } from "@/lib/cast/castClient";
    
export default function CastController({ initialState }: { initialState: any }) {
  const [state, setState] = useState(initialState || {});

  function updateState(patch: any) {
    const next = {
      ...state,
      ...patch,
    };

    setState(next);
    sendCastState(next);
  }

  return (
    <div className="p-4 text-white">
      <h1 className="font-bold mb-4">Cast Controller</h1>

      <div className="grid grid-cols-3 gap-2">
        {(state.children || []).map((child: any, i: number) => {
          const active = state.activeChildIndex === i;

          return (
            <button
              key={child?.id || i}
              onClick={() =>
                updateState({
                  activeChildIndex: active ? null : i,
                })
              }
              className={`p-2 rounded ${
                active ? "bg-blue-600" : "bg-neutral-800"
              }`}
            >
              {child?.label || `Stream ${i + 1}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}