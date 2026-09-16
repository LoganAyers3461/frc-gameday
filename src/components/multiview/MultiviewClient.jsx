"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import React from "react";

import { LAYOUTS, pickLayout } from "@/lib/layouts";

import EventLocalTime from "../gameday/navbar/EventLocalTime";

import { useRouter } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function MultiviewClient({
  isDivisional,
  parentEvent,
  children = [],
}) {
  const router = useRouter();

  /*
   * Keep one stable child per stream.
   *
   * The stream component itself should remain mounted while its
   * wrapper moves between layout slots. This prevents webcast
   * components from being recreated whenever the layout changes.
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
    setLabels((previous) => {
      if (previous[index] === label) {
        return previous;
      }

      return {
        ...previous,
        [index]: label,
      };
    });
  }

  // ==============================
  // LAYOUT STATE
  // ==============================

  const [selectedLayout, setSelectedLayout] =
    useState(null);

  const [activeChildIndex, setActiveChildIndex] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const autoLayout = pickLayout(
    childArray.length || 1
  );

  const layoutKey =
    selectedLayout ?? autoLayout;

  const layout =
    LAYOUTS[layoutKey] ?? LAYOUTS.single;

  const presentation =
    layout.presentation ?? {
      matchInfo: "full",
      teamTracker: "sides",
    };

  const viewContext = useMemo(
    () => ({
      layoutKey,
      ...presentation,
    }),
    [layoutKey, presentation]
  );

  // ==============================
  // HOME ORDER
  // ==============================

  const [homeOrder, setHomeOrder] =
    useState(() =>
      childArray.map((_, index) => index)
    );

  useEffect(() => {
    setHomeOrder(
      childArray.map((_, index) => index)
    );
  }, [childArray.length]);

  // ==============================
  // SLOT ORDER
  // ==============================

  const slotOrder = useMemo(() => {
    if (activeChildIndex == null) {
      return homeOrder;
    }

    const next = [...homeOrder];
    const index = next.indexOf(
      activeChildIndex
    );

    if (index > -1) {
      next.splice(index, 1);
      next.unshift(activeChildIndex);
    }

    return next;
  }, [
    activeChildIndex,
    homeOrder,
  ]);

  const visibleKeys = useMemo(
    () =>
      new Set(
        slotOrder.slice(
          0,
          layout.slots.length
        )
      ),
    [slotOrder, layout.slots.length]
  );

  function isOffScreen(childIndex) {
    return !visibleKeys.has(childIndex);
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* =========================
            TOP BAR
        ========================== */}

        <div className="flex h-10 shrink-0 items-center justify-between border-b border-neutral-800 px-2">
          {/* LEFT */}

          <div className="flex min-w-0 items-center">
            <button
              onClick={() => router.push("/")}
              className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
              title="Home"
              aria-label="Home"
            >
              <HomeIcon className="h-5 w-4" />
            </button>

            {isDivisional &&
            parentEvent ? (
              <div className="flex min-w-0 flex-col pl-2">
                <span className="truncate text-sm font-bold">
                  {parentEvent.name}
                </span>

                <span className="text-xs text-gray-400">
                  <EventLocalTime
                    timezone={
                      parentEvent.timezone
                    }
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

          {/* CENTER */}

          <div className="flex min-w-0 gap-1 overflow-hidden">
            {homeOrder.map(
              (childIndex) => {
                const isActive =
                  childIndex ===
                  activeChildIndex;

                const isDimmed =
                  isOffScreen(childIndex);

                const label =
                  labels[childIndex] ||
                  `Stream ${
                    childIndex + 1
                  }`;

                return (
                  <button
                    key={childIndex}
                    onClick={() => {
                      setActiveChildIndex(
                        (current) =>
                          current ===
                          childIndex
                            ? null
                            : childIndex
                      );
                    }}
                    className={[
                      "max-w-48 truncate rounded px-2 py-1 text-xs transition",
                      "hover:bg-neutral-700",
                      isActive
                        ? "ring-2 ring-white"
                        : "",
                      isDimmed
                        ? "bg-gray-800 opacity-60"
                        : "bg-neutral-800 opacity-100",
                    ].join(" ")}
                  >
                    {label.replace(
                      "- FIRST Robotics Competition",
                      ""
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* RIGHT */}

          <button
            onClick={() =>
              setSidebarOpen(
                (value) => !value
              )
            }
            className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
            title="Multiview settings"
            aria-label="Multiview settings"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
        </div>

        {/* =========================
            GRID

            Every child remains mounted.

            Visible children occupy a layout slot.
            Children beyond the available slot count
            remain mounted but are visually hidden.
        ========================== */}

        <div className="relative min-h-0 flex-1">
          {childArray.map(
            (child, childIndex) => {
              const slotIndex =
                slotOrder.findIndex(
                  (index) =>
                    index === childIndex
                );

              const slotLayout =
                layout.slots[slotIndex];

              const visible =
                Boolean(slotLayout);

              const childContext = {
                ...viewContext,
                slotIndex,
                visible,
              };

              return (
                <div
                  key={
                    child?.key ??
                    childIndex
                  }
                  className={
                    visible
                      ? "absolute"
                      : "pointer-events-none absolute invisible"
                  }
                  style={
                    visible
                      ? {
                          left: `${slotLayout.x}%`,
                          top: `${slotLayout.y}%`,
                          width: `${slotLayout.w}%`,
                          height: `${slotLayout.h}%`,
                          transition:
                            "all 300ms ease",
                        }
                      : {
                          left: 0,
                          top: 0,
                          width: 1,
                          height: 1,
                          overflow:
                            "hidden",
                        }
                  }
                >
                  {React.cloneElement(
                    child,
                    {
                      registerLabel:
                        (label) =>
                          registerLabel(
                            childIndex,
                            label
                          ),

                      multiview:
                        childContext,
                    }
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* =========================
          SIDEBAR
      ========================== */}

      <div
        onClick={() =>
          setSidebarOpen(false)
        }
        className={[
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <div
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-[clamp(260px,25vw,400px)] flex-col",
          "border-l border-neutral-700 bg-neutral-900 p-3 shadow-xl",
          "transition-transform duration-300",
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mb-2 text-sm font-bold">
            Stream Priority
          </div>

          <div className="space-y-1">
            {homeOrder.map(
              (childIndex) => {
                const label =
                  labels?.[childIndex] ||
                  `Stream ${
                    childIndex + 1
                  }`;

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
                          setHomeOrder(
                            (previous) => {
                              const index =
                                previous.indexOf(
                                  childIndex
                                );

                              if (
                                index <= 0
                              ) {
                                return previous;
                              }

                              const next = [
                                ...previous,
                              ];

                              [
                                next[
                                  index - 1
                                ],
                                next[index],
                              ] = [
                                next[index],
                                next[
                                  index - 1
                                ],
                              ];

                              return next;
                            }
                          );
                        }}
                        className="rounded bg-neutral-700 px-2 py-0.5 text-xs hover:bg-neutral-600"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() => {
                          setHomeOrder(
                            (previous) => {
                              const index =
                                previous.indexOf(
                                  childIndex
                                );

                              if (
                                index ===
                                  -1 ||
                                index ===
                                  previous.length -
                                    1
                              ) {
                                return previous;
                              }

                              const next = [
                                ...previous,
                              ];

                              [
                                next[
                                  index + 1
                                ],
                                next[index],
                              ] = [
                                next[index],
                                next[
                                  index + 1
                                ],
                              ];

                              return next;
                            }
                          );
                        }}
                        className="rounded bg-neutral-700 px-2 py-0.5 text-xs hover:bg-neutral-600"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="my-2 h-px bg-neutral-700" />

          <div className="pb-1 font-bold">
            Layouts
          </div>

          {Object.entries(
            LAYOUTS
          ).map(
            ([key, value]) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedLayout(
                    key
                  )
                }
                className={[
                  "block w-full rounded px-2 py-1 text-left text-sm hover:bg-neutral-800",
                  layoutKey === key
                    ? "bg-neutral-700"
                    : "",
                ].join(" ")}
              >
                {value.name}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}