"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { LAYOUTS, pickLayout, pickHighlightLayout } from "@/lib/layouts";
import React from "react";
import EventLocalTime from "../gameday/navbar/EventLocalTime";
import { useRouter } from "next/navigation";
import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { createRoot } from "react-dom/client";

// ==============================
// SIGNAL BUS
// ==============================
const listeners = new Set();

export function emitMultiviewSignal(signal) {
  listeners.forEach((listener) => listener(signal));
}

function useMultiviewSignal(handler) {
  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    listeners.add(stableHandler);

    return () => {
      listeners.delete(stableHandler);
    };
  }, [stableHandler]);
}

// ==============================
// COMPONENT
// ==============================
export default function MultiviewClient({
  isDivisional,
  parentEvent,
  children = [],
}) {
  const router = useRouter();

  /*
   * IMPORTANT:
   *
   * Keep one stable mapped child per stream.
   *
   * The stream components must NOT be conditionally rendered according
   * to their current slot. Their wrappers move between slots instead.
   * This keeps the underlying video/stream component mounted and prevents
   * the stream from reloading whenever the layout changes.
   */
  const childArray = useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  // ==============================
  // LABEL SYSTEM
  // ==============================
  const [labels, setLabels] = useState({});

  function registerLabel(index, label) {
    setLabels((prev) => {
      if (prev[index] === label) return prev;

      return {
        ...prev,
        [index]: label,
      };
    });
  }

  // ==============================
  // LAYOUT STATE
  // ==============================
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [baseLayout, setBaseLayout] = useState(null);
  const [activeChildIndex, setActiveChildIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const layoutSelectValue = childArray.length || 1;
  const autoLayout = pickLayout(layoutSelectValue);

  const layoutKey = selectedLayout ?? autoLayout;
  const layout = LAYOUTS[layoutKey];

  // ==============================
  // HOME ORDER
  // ==============================
  const [homeOrder, setHomeOrder] = useState(() =>
    childArray.map((_, index) => index)
  );

  useEffect(() => {
    setHomeOrder(childArray.map((_, index) => index));
  }, [childArray.length]);

  // ==============================
  // SLOT ORDER
  // ==============================
  const slotOrder = useMemo(() => {
    if (activeChildIndex == null) {
      return homeOrder;
    }

    const next = [...homeOrder];
    const index = next.indexOf(activeChildIndex);

    if (index > -1) {
      next.splice(index, 1);
      next.unshift(activeChildIndex);
    }

    return next;
  }, [activeChildIndex, homeOrder]);

  const visibleKeys = useMemo(() => {
    return slotOrder.slice(0, layout.slots.length);
  }, [slotOrder, layout.slots.length]);

  function isOffScreen(childIndex) {
    return !visibleKeys.includes(childIndex);
  }

  // ==============================
  // SIGNAL LISTENER
  // ==============================
  useMultiviewSignal((signal) => {
    if (signal.type !== "match_imminent") {
      return;
    }

    const childIndex = childArray.findIndex(
      (child) => child?.props?.matchKey === signal.matchKey
    );

    if (childIndex === -1) {
      return;
    }

    setActiveChildIndex(childIndex);

    setBaseLayout(selectedLayout ?? autoLayout);
    setSelectedLayout(
      pickHighlightLayout(childArray.length)
    );
  });

  // ==============================
  // PiP
  // ==============================
  const [pipWindow, setPipWindow] = useState(null);
  const pipContainerRef = useRef(null);

  useEffect(() => {
    if (!pipWindow || !pipContainerRef.current) {
      return;
    }

    if (!pipContainerRef.current._root) {
      pipContainerRef.current._root = createRoot(
        pipContainerRef.current
      );
    }

    const activeChild =
      activeChildIndex != null
        ? React.cloneElement(childArray[activeChildIndex])
        : React.cloneElement(childArray[0]);

    pipContainerRef.current._root.render(activeChild);
  }, [pipWindow, activeChildIndex, childArray]);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white flex">
      <div className="flex-1 flex flex-col">

        {/* =========================
            TOP BAR
        ========================== */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-neutral-800 px-2">

          {/* LEFT */}
          <div className="flex items-center min-w-0">
            <button
              onClick={() => router.push("/")}
              className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
            >
              <HomeIcon className="h-5 w-4" />
            </button>

            {isDivisional && parentEvent ? (
              <div className="flex min-w-0 flex-col pl-2">
                <span className="truncate text-sm font-bold">
                  {parentEvent.name}
                </span>

                <span className="text-xs text-gray-400">
                  <EventLocalTime
                    timezone={parentEvent.timezone}
                  />
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col pl-2">
                <span className="text-sm font-bold">
                  FieldView
                </span>

                <span className="text-xs text-gray-400">
                  Powered by The Blue Alliance
                </span>
              </div>
            )}
          </div>

          {/* CENTER: STREAM BUTTONS */}
          <div className="flex gap-1">
            {homeOrder.map((childIndex) => {
              const isActive =
                childIndex === activeChildIndex;

              const isDimmed =
                isOffScreen(childIndex);

              const label =
                labels[childIndex] ||
                `Stream ${childIndex + 1}`;

              return (
                <button
                  key={childIndex}
                  onClick={() => {
                    const isSame =
                      childIndex === activeChildIndex;

                    if (isSame) {
                      setActiveChildIndex(null);

                      if (baseLayout) {
                        setSelectedLayout(baseLayout);
                        setBaseLayout(null);
                      } else {
                        setSelectedLayout(null);
                      }

                      return;
                    }

                    setActiveChildIndex(childIndex);

                    setBaseLayout(
                      selectedLayout ?? autoLayout
                    );

                    setSelectedLayout(
                      pickHighlightLayout(
                        isDimmed
                          ? layout.slots.length + 1
                          : layout.slots.length
                      )
                    );
                  }}
                  className={`
                    truncate rounded px-2 py-1 text-xs transition
                    hover:bg-neutral-700
                    ${isActive ? "ring-2 ring-white" : ""}
                    ${
                      isDimmed
                        ? "bg-gray-800 opacity-60"
                        : "bg-neutral-800 opacity-100"
                    }
                  `}
                >
                  {label.replace(
                    "- FIRST Robotics Competition",
                    ""
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT */}
          <button
            onClick={() =>
              setSidebarOpen((value) => !value)
            }
            className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
        </div>

        {/* =========================
            GRID

            DO NOT TURN THIS INTO A
            conditional slot renderer.

            Every child remains mounted.
            Only its wrapper moves.
        ========================== */}
        <div className="relative flex-1">
          {childArray.map((child, childIndex) => {
            const slotIndex = slotOrder.findIndex(
              (index) => index === childIndex
            );

            const slotLayout = layout.slots[slotIndex];

            if (!slotLayout) {
              return null;
            }

            return (
              <div
                key={child?.key ?? childIndex}
                style={{
                  position: "absolute",
                  left: `${slotLayout.x}%`,
                  top: `${slotLayout.y}%`,
                  width: `${slotLayout.w}%`,
                  height: `${slotLayout.h}%`,
                  transition: "all 300ms ease",
                }}
              >
                {React.cloneElement(child, {
                  registerLabel: (label) =>
                    registerLabel(childIndex, label),

                  multiview: {
                    layoutKey,
                    layout: layout,
                    matchStrip: layout.matchStrip,
                  },
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================
          SIDEBAR OVERLAY
      ========================== */}
      <>
        {/* BACKDROP */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`
            fixed inset-0 z-40 bg-black/50
            transition-opacity duration-300
            ${
              sidebarOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        />

        {/* SIDEBAR */}
        <div
          className={`
            fixed right-0 top-0 z-50 flex h-full
            w-[clamp(260px,25vw,400px)]
            flex-col border-l border-neutral-700
            bg-neutral-900 p-3 shadow-xl
            transition-transform duration-300
            ${
              sidebarOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="mb-2 text-sm font-bold">
              Stream Priority
            </div>

            <div className="space-y-1">
              {homeOrder.map((childIndex) => {
                const label =
                  labels?.[childIndex] ||
                  `Stream ${childIndex + 1}`;

                return (
                  <div
                    key={childIndex}
                    className="flex items-center justify-between rounded bg-neutral-800 px-2 py-1"
                  >
                    <span className="truncate text-xs">
                      {label.replace(
                        "- FIRST Robotics Competition",
                        ""
                      )}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setHomeOrder((prev) => {
                            const index =
                              prev.indexOf(childIndex);

                            if (index <= 0) {
                              return prev;
                            }

                            const next = [...prev];

                            [
                              next[index - 1],
                              next[index],
                            ] = [
                              next[index],
                              next[index - 1],
                            ];

                            return next;
                          });
                        }}
                        className="rounded bg-neutral-700 px-2 py-0.5 text-xs"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() => {
                          setHomeOrder((prev) => {
                            const index =
                              prev.indexOf(childIndex);

                            if (
                              index === -1 ||
                              index === prev.length - 1
                            ) {
                              return prev;
                            }

                            const next = [...prev];

                            [
                              next[index + 1],
                              next[index],
                            ] = [
                              next[index],
                              next[index + 1],
                            ];

                            return next;
                          });
                        }}
                        className="rounded bg-neutral-700 px-2 py-0.5 text-xs"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-2 h-px bg-neutral-700" />

            <div className="pb-1 font-bold">
              Layouts
            </div>

            {Object.entries(LAYOUTS).map(
              ([key, value]) => (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedLayout(key)
                  }
                  className={`
                    block w-full rounded px-2 py-1
                    text-left text-sm
                    hover:bg-neutral-800
                    ${
                      layoutKey === key
                        ? "bg-neutral-700"
                        : ""
                    }
                  `}
                >
                  {value.name}
                </button>
              )
            )}
          </div>
        </div>
      </>
    </div>
  );
}