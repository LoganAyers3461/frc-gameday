"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { LAYOUTS, pickLayout, pickHighlightLayout } from "@/lib/layouts";
import React from "react";
import { useRouter } from "next/navigation";
import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

// ==============================
// SIGNAL BUS
// ==============================
const listeners = new Set();

export function emitMultiviewSignal(signal) {
  listeners.forEach((l) => l(signal));
}

function useMultiviewSignal(handler) {
  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    listeners.add(stableHandler);
    return () => listeners.delete(stableHandler);
  }, [stableHandler]);
}

// ==============================
// COMPONENT
// ==============================
export default function MultiviewClient({
  children = [],
}) {
  const router = useRouter();

  const streams = useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  // eventKey extraction (MUST exist)
  const getKey = (child, i) => child?.props?.event ?? i;

  const streamKeys = useMemo(
    () => streams.map(getKey),
    [streams]
  );

  // ==============================
  // PRIORITY (eventKey ordering)
  // ==============================
  const [priority, setPriority] = useState([]);

  useEffect(() => {
    setPriority(streamKeys);
  }, [streamKeys]);

  function moveUp(key) {
    setPriority((prev) => {
      const i = prev.indexOf(key);
      if (i <= 0) return prev;
      const copy = [...prev];
      [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
      return copy;
    });
  }

  function moveDown(key) {
    setPriority((prev) => {
      const i = prev.indexOf(key);
      if (i === -1 || i === prev.length - 1) return prev;
      const copy = [...prev];
      [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]];
      return copy;
    });
  }

  // ==============================
  // LAYOUT
  // ==============================
  const [manualOverride, setManualOverride] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);

  const layoutKey = manualOverride
    ? selectedLayout
    : pickLayout(streams.length || 1);

  const layout = LAYOUTS[layoutKey];

  // ==============================
  // SLOT ASSIGNMENT (PURE FUNCTION)
  // ==============================
  const slotToKey = layout.slots.map((_, i) => priority[i]);

  // ==============================
  // KEY → SLOT INDEX MAP (IMPORTANT)
  // ==============================
  const keyToSlotIndex = useMemo(() => {
    const map = new Map();
    slotToKey.forEach((key, i) => {
      if (key != null) map.set(key, i);
    });
    return map;
  }, [slotToKey]);

  // ==============================
  // SIGNALS
  // ==============================
  useMultiviewSignal((signal) => {
    if (signal.type !== "match_imminent") return;

    setSelectedLayout(pickHighlightLayout(layout.slots.length));
    setManualOverride(true);
  });

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-2 h-10 border-b border-neutral-800">

        <button
          onClick={() => router.push("/")}
          className="px-3 py-1 bg-neutral-800 rounded"
        >
          <HomeIcon className="w-4 h-5" />
        </button>

        {/* STREAM CONTROLS */}
        <div className="flex gap-1">
          {priority.map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedLayout(null);
                setManualOverride(false);
              }}
              className="px-2 py-1 text-xs bg-neutral-800 rounded"
            >
              {key}
            </button>
          ))}
        </div>

        <button className="px-3 py-1 bg-neutral-800 rounded">
          <Squares2X2Icon className="w-5 h-5" />
        </button>
      </div>

      {/* GRID (IMPORTANT PART) */}
      <div className="relative flex-1">

        {/* RENDER STREAMS ONLY ONCE */}
        {streams.map((child, i) => {
          const key = getKey(child, i);
          const slotIndex = keyToSlotIndex.get(key);

          // fallback off-screen if not assigned
          const slot = layout.slots[slotIndex] ?? {
            x: -1000,
            y: -1000,
            w: 0,
            h: 0,
          };

          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.w}%`,
                height: `${slot.h}%`,
                transition: "transform 300ms ease, left 300ms ease, top 300ms ease",
              }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* SIDEBAR */}
      <div className="w-64 bg-neutral-900 border-l border-neutral-700 p-3">
        <div className="font-bold text-sm">Priority</div>

        {priority.map((key) => (
          <div key={key} className="flex justify-between bg-neutral-800 p-1 rounded">
            <span>{key}</span>
            <div className="flex gap-1">
              <button onClick={() => moveUp(key)}>↑</button>
              <button onClick={() => moveDown(key)}>↓</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}