"use client";

import { useMemo, useState, useEffect } from "react";
import { LAYOUTS, pickLayout } from "@/lib/layouts";
import GamedayWidget from "@/components/gameday/GamedayWidget";
import EventInfo from "@/components/gameday/navbar/EventInfo";
import EventLocalTime from "@/components/gameday/navbar/EventLocalTime";

export default function MultiviewClient({
  parentEvent,
  teams = [],
  divisionKeys = [],
}) {
  // ==============================
  // BASE DATA
  // ==============================
  const frames = divisionKeys;

  const [manualOverride, setManualOverride] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==============================
  // LAYOUT
  // ==============================
  const autoLayout = pickLayout(frames.length);
  const layoutKey = manualOverride ? selectedLayout : autoLayout;
  const layout = LAYOUTS[layoutKey];

  // ==============================
  // PRIORITY ORDER (SOURCE OF TRUTH)
  // ==============================
  const [order, setOrder] = useState(() => frames);

  // enabled map (optional toggle system preserved)
  const [enabled, setEnabled] = useState(() => {
    const map = {};
    frames.forEach(f => (map[f] = true));
    return map;
  });

  // ==============================
  // DERIVE ACTIVE ORDER
  // ==============================
  const activeOrder = useMemo(() => {
    return order.filter(f => enabled[f]);
  }, [order, enabled]);

  const capacity = layout.slots.length;

  const visibleFrames = useMemo(() => {
    return activeOrder.slice(0, capacity);
  }, [activeOrder, capacity]);

  // ==============================
  // SLOT ASSIGNMENT (PURE)
  // ==============================
  const slotAssignments = useMemo(() => {
    const result = {};

    for (let i = 0; i < layout.slots.length; i++) {
      result[i] = visibleFrames[i] ?? null;
    }

    return result;
  }, [visibleFrames, layout.slots]);

  // ==============================
  // TOGGLE ENABLE (does NOT reorder)
  // ==============================
  function toggleDivision(key) {
    setEnabled(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // ==============================
  // FOCUS BUTTON (MOVE TO TOP)
  // ==============================
  function focusDivision(key) {
    setOrder(prev => {
      const filtered = prev.filter(k => k !== key);
      return [key, ...filtered];
    });
  }

  // ==============================
  // DRAG & DROP REORDER (SIDEBAR)
  // ==============================
  function onDragStart(e, index) {
    e.dataTransfer.setData("from", index);
  }

  function onDrop(e, toIndex) {
    const fromIndex = Number(e.dataTransfer.getData("from"));
    if (isNaN(fromIndex)) return;

    setOrder(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  // ==============================
  // LAYOUT CONTROL
  // ==============================
  function resetToAuto() {
    setManualOverride(false);
    setSelectedLayout(null);
  }

  function selectLayout(key) {
    setSelectedLayout(key);
    setManualOverride(true);
  }

  // ==============================
  // EMPTY STATE
  // ==============================
  if (frames.length === 0) {
    return (
      <div className="w-screen h-screen">
        <GamedayWidget
          event={parentEvent}
          team={teams[0]}
          isMultiview={false}
        />
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="h-screen bg-black text-white overflow-hidden flex">

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* ================= TOP BAR ================= */}
        <div className="flex justify-between items-center px-2 h-10 border-b border-neutral-800">

          {/* EVENT INFO */}
          <div className="text-sm font-bold flex gap-2 items-center">
            <EventInfo event={parentEvent} />
            <span className="text-neutral-500">
              ({frames.length} divisions)
            </span>
            <span className="text-neutral-400">
              <EventLocalTime timezone={parentEvent.timezone} />
            </span>
          </div>

          {/* FOCUS BUTTONS */}
          <div className="flex gap-1 flex-wrap">
            {order.map(key => {
              const isOnScreen = visibleFrames.includes(key);

              return (
                <button
                  key={key}
                  onClick={() => focusDivision(key)}
                  className={`
                    px-2 py-1 text-xs rounded transition
                    ${isOnScreen ? "bg-neutral-700" : "bg-neutral-900 opacity-40"}
                    hover:bg-neutral-600
                  `}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* RIGHT */}
          <div>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
            >
              Layouts
            </button>
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="relative flex-1">
          {layout.slots.map((slot, index) => {
            const frameKey = slotAssignments[index];

            if (!frameKey) return null;

            return (
              <div
                key={`${frameKey}-${index}`}
                style={{
                  position: "absolute",
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.w}%`,
                  height: `${slot.h}%`,
                }}
                className="transition-all duration-300 ease-in-out"
              >
                <GamedayWidget
                  event={frameKey}
                  team={teams[0]}
                  isMultiview={true}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="w-72 bg-neutral-900 border-l border-neutral-700 p-3 flex flex-col gap-3">

          <div className="font-bold">Layouts</div>

          <button
            onClick={resetToAuto}
            className="px-2 py-1 bg-green-600 rounded text-sm"
          >
            Auto Layout ({autoLayout})
          </button>

          <div className="h-px bg-neutral-700" />

          {Object.keys(LAYOUTS).map(key => (
            <button
              key={key}
              onClick={() => selectLayout(key)}
              className={`
                text-left px-2 py-1 rounded text-sm
                hover:bg-neutral-800
                ${layoutKey === key ? "bg-neutral-700" : ""}
              `}
            >
              {key}
            </button>
          ))}

          {/* ================= PRIORITY DRAG LIST ================= */}
          <div className="mt-4 font-bold text-sm">Priority Order</div>

          <div className="flex flex-col gap-1">
            {order.map((key, index) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={allowDrop}
                onDrop={(e) => onDrop(e, index)}
                className="px-2 py-1 bg-neutral-800 rounded text-sm cursor-move"
              >
                {index + 1}. {key}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}