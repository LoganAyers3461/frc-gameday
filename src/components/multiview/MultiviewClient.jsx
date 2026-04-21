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
    const parentKey = parentEvent?.key;
    const frames = parentKey
    ? [...divisionKeys, parentKey]
    : divisionKeys;

  // ==============================
  // LAYOUT STATE
  // ==============================
  const [manualOverride, setManualOverride] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const autoLayout = pickLayout(frames.length);
  const layoutKey = manualOverride ? selectedLayout : autoLayout;
  const layout = LAYOUTS[layoutKey];
  const capacity = layout.slots.length;

  // ==============================
  // PRIORITY ORDER (NEW CORE MODEL)
  // ==============================
  const [priorityOrder, setPriorityOrder] = useState(() => frames);

  // enabled map (still used for toggling)
  const [enabled, setEnabled] = useState(() => {
    const map = {};
    frames.forEach(f => (map[f] = true));
    return map;
  });

  // ==============================
  // SLOT ASSIGNMENT (DERIVED FROM PRIORITY)
  // ==============================
  const slotAssignments = useMemo(() => {
    const active = priorityOrder.filter(f => enabled[f]);

    const next = {};

    for (let i = 0; i < layout.slots.length; i++) {
      next[i] = active[i] ?? null;
    }

    return next;
  }, [priorityOrder, enabled, layoutKey]);

  const assignedFrames = useMemo(
    () => Object.values(slotAssignments).filter(Boolean),
    [slotAssignments]
  );

  const getSlotOf = (key) =>
    Object.entries(slotAssignments).find(([_, v]) => v === key)?.[0];

  // ==============================
  // TOGGLE ENABLE/DISABLE
  // ==============================
  function toggleDivision(key) {
    setEnabled(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // ==============================
  // FOCUS (MOVE TO TOP)
  // ==============================
  function focusDivision(key) {
    setPriorityOrder(prev => [
      key,
      ...prev.filter(k => k !== key),
    ]);
  }

  // ==============================
  // DRAG + DROP REORDER (SIDEBAR)
  // ==============================
  function movePriority(fromIndex, toIndex) {
    setPriorityOrder(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  function handleDragStart(e, index) {
    e.dataTransfer.setData("fromIndex", index);
  }

  function handleDrop(e, toIndex) {
    const fromIndex = Number(e.dataTransfer.getData("fromIndex"));
    if (fromIndex === toIndex) return;
    movePriority(fromIndex, toIndex);
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* ================= CONTROL BAR ================= */}
        <div className="flex justify-between items-center px-2 h-10 border-b border-neutral-800">

          {/* LEFT */}
          <div className="text-sm font-bold flex gap-2 items-center">
            <EventInfo event={parentEvent} />
            <span className="text-neutral-500">
              ({divisionKeys.length} divisions)
            </span>
            <span className="text-neutral-400">
              <EventLocalTime timezone={parentEvent.timezone} />
            </span>
          </div>

          {/* CENTER: FOCUS BUTTONS */}
          <div className="flex gap-1 flex-wrap">
            {priorityOrder.map(key => {
              const isOn = enabled[key];
              const slotIndex = getSlotOf(key);

              return (
                <button
                  key={key}
                  onClick={() => focusDivision(key)}
                  className={`
                    px-2 py-1 text-xs rounded transition
                    ${isOn ? "bg-neutral-700" : "bg-neutral-900 opacity-30"}
                    ${slotIndex === "0" ? "ring-1 ring-white" : ""}
                  `}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* RIGHT */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
          >
            Layouts
          </button>
        </div>

        {/* ================= GRID ================= */}
        <div className="relative flex-1">

          {frames.map(frameKey => {
            const slotIndex = getSlotOf(frameKey);
            if (slotIndex === undefined) return null;

            const slot = layout.slots[slotIndex];
            if (!slot) return null;

            return (
              <div
                key={frameKey}
                style={{
                  position: "absolute",
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.w}%`,
                  height: `${slot.h}%`,
                }}
                className="transition-all duration-300 ease-in-out will-change-transform"
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
        <div className="w-64 bg-neutral-900 border-l border-neutral-700 p-3 flex flex-col gap-3">

          {/* Layouts */}
          <div className="font-bold">Layouts</div>

          <button
            onClick={resetToAuto}
            className="px-2 py-1 bg-green-600 rounded text-sm"
          >
            Auto Layout ({autoLayout})
          </button>

          <div className="h-px bg-neutral-700 my-2" />

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
          <div className="h-px bg-neutral-700 my-2" />

          <div className="font-bold text-sm">Priority Order</div>

            <div className="flex flex-col gap-1 mt-2">
            {priorityOrder.map((key, index) => (
                <div
                key={key}
                className="flex items-center justify-between px-2 py-1 bg-neutral-800 rounded text-xs"
                >
                <span>{key}</span>

                <div className="flex gap-1">
                    <button
                    onClick={() => {
                        if (index === 0) return;
                        setPriorityOrder(prev => {
                        const next = [...prev];
                        [next[index - 1], next[index]] =
                            [next[index], next[index - 1]];
                        return next;
                        });
                    }}
                    className="px-1 hover:bg-neutral-700 rounded"
                    >
                    ↑
                    </button>

                    <button
                    onClick={() => {
                        if (index === priorityOrder.length - 1) return;
                        setPriorityOrder(prev => {
                        const next = [...prev];
                        [next[index + 1], next[index]] =
                            [next[index], next[index + 1]];
                        return next;
                        });
                    }}
                    className="px-1 hover:bg-neutral-700 rounded"
                    >
                    ↓
                    </button>
                </div>
                </div>
            ))}
            </div>

        </div>
      )}
    </div>
  );
}