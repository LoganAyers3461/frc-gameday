"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { LAYOUTS, pickLayout } from "@/lib/layouts";
import EventLocalTime from "../gameday/navbar/EventLocalTime";
import GamedayWidget from "../gameday/GamedayWidget";

export default function MultiviewClient({
  events = [],
  isDivisional = false,
  parentEvent = null,
}) {
  const router = useRouter();

  /*
   * `streams` is the stable set of widgets Multiview owns.
   *
   * IMPORTANT:
   * This array is intentionally never reordered.
   * React therefore sees the same GamedayWidget siblings for
   * the entire lifetime of the Multiview.
   */
  const initialStreams = useMemo(
    () => [
      ...new Set(
        events
          .filter(Boolean)
          .map((event) => String(event))
      ),
    ],
    [events]
  );

  const [streams, setStreams] = useState(initialStreams);

  /*
   * `priority` controls which widget occupies which layout slot.
   *
   * This is deliberately separate from `streams`.
   */
  const [priority, setPriority] = useState(
    initialStreams
  );

  const [layoutKey, setLayoutKey] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [eventPickerOpen, setEventPickerOpen] =
    useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [availableEvents, setAvailableEvents] =
    useState([]);
  const [eventsLoading, setEventsLoading] =
    useState(false);

  const [labels, setLabels] = useState({});

  const selectedLayoutKey =
    layoutKey ?? pickLayout(streams.length || 1);

  const layout =
    LAYOUTS[selectedLayoutKey] ?? LAYOUTS.single;

  const presentation =
    layout.presentation ?? {
      teamTracker: "sides",
      matchInfo: "full",
    };

  /*
   * The selected event is temporarily promoted to slot zero
   * for the visual presentation. This does not modify priority.
   */
  const slotOrder = useMemo(() => {
    if (!activeKey || !priority.includes(activeKey)) {
      return priority;
    }

    return [
      activeKey,
      ...priority.filter(
        (eventKey) => eventKey !== activeKey
      ),
    ];
  }, [activeKey, priority]);

  const registerLabel = useCallback(
    (eventKey, label) => {
      setLabels((current) => {
        if (current[eventKey] === label) {
          return current;
        }

        return {
          ...current,
          [eventKey]: label,
        };
      });
    },
    []
  );

  /*
   * Move only the priority array.
   *
   * `streams` — and therefore React's widget order —
   * remains completely untouched.
   */
  const move = useCallback(
    (position, direction) => {
      setPriority((current) => {
        const target = position + direction;

        if (
          target < 0 ||
          target >= current.length
        ) {
          return current;
        }

        const next = [...current];

        [next[position], next[target]] = [
          next[target],
          next[position],
        ];

        return next;
      });
    },
    []
  );

  /*
   * Update only the event portion of the URL.
   */
  const updateUrl = useCallback((eventKeys) => {
    const url = new URL(window.location.href);

    url.searchParams.delete("event");

    for (const eventKey of eventKeys) {
      url.searchParams.append("event", eventKey);
    }

    window.history.pushState({}, "", url);
  }, []);

  /*
   * Browser Back / Forward reconstructs the event set.
   */
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);

      const eventKeys = [
        ...new Set(
          url.searchParams
            .getAll("event")
            .filter(Boolean)
        ),
      ];

      setStreams(eventKeys);
      setPriority(eventKeys);
      setActiveKey(null);
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  /*
   * Fetch active events only when the picker is opened.
   */
  useEffect(() => {
    if (!eventPickerOpen) {
      return;
    }

    let cancelled = false;

    async function loadEvents() {
      setEventsLoading(true);

      try {
        const response = await fetch(
          "/api/events/active",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load events: ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setAvailableEvents(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load active events:",
          error
        );

        if (!cancelled) {
          setAvailableEvents([]);
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, [eventPickerOpen]);

  const openEventPicker = useCallback(() => {
    setEventSearch("");
    setEventPickerOpen(true);
  }, []);

  const addEvent = useCallback(
    (event) => {
      const eventKey = String(event.key);

      if (streams.includes(eventKey)) {
        return;
      }

      const nextStreams = [
        ...streams,
        eventKey,
      ];

      setStreams(nextStreams);
      setPriority((current) => [
        ...current,
        eventKey,
      ]);

      updateUrl(nextStreams);
      setEventPickerOpen(false);
    },
    [streams, updateUrl]
  );

  const activeEventKeys = useMemo(
    () => new Set(streams),
    [streams]
  );

  const filteredEvents = useMemo(() => {
    const query = eventSearch
      .trim()
      .toLowerCase();

    return availableEvents
      .filter(
        (event) =>
          !activeEventKeys.has(
            String(event.key)
          )
      )
      .filter((event) => {
        if (!query) {
          return true;
        }

        return [
          event.name,
          event.short_name,
          event.key,
          event.city,
          event.state_prov,
          event.country,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      });
  }, [
    availableEvents,
    activeEventKeys,
    eventSearch,
  ]);

  const emptySlotCount = Math.max(
    0,
    layout.slots.length - streams.length
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-neutral-800 px-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="icon-button"
              title="Home"
            >
              <HomeIcon />
            </button>

            {isDivisional && parentEvent ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {parentEvent.name}
                </div>

                <div className="text-[10px] text-neutral-500">
                  <EventLocalTime
                    timezone={parentEvent.timezone}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold">
                  FieldView
                </div>

                <div className="text-[10px] text-neutral-500">
                  Powered by The Blue Alliance
                </div>
              </div>
            )}
          </div>

          <div className="flex min-w-0 gap-1 overflow-hidden">
            {slotOrder.map(
              (eventKey, index) => (
                <button
                  key={eventKey}
                  onClick={() =>
                    setActiveKey(
                      (current) =>
                        current === eventKey
                          ? null
                          : eventKey
                    )
                  }
                  className={`max-w-48 truncate rounded px-2 py-1 text-xs ${
                    activeKey === eventKey
                      ? "ring-2 ring-white"
                      : "bg-neutral-800"
                  }`}
                >
                  {(
                    labels[eventKey] ??
                    `Stream ${index + 1}`
                  ).replace(
                    "- FIRST Robotics Competition",
                    ""
                  )}
                </button>
              )
            )}
          </div>

          <button
            onClick={() =>
              setSidebarOpen(
                (value) => !value
              )
            }
            className="icon-button"
            title="Multiview settings"
          >
            <Squares2X2Icon />
          </button>
        </header>

        <main className="relative min-h-0 flex-1">
          {/*
           * CRITICAL:
           *
           * Render widgets in stable `streams` order,
           * NOT in `priority` order.
           *
           * Priority only determines `slotIndex`.
           */}
          {streams.map((eventKey) => {
            const slotIndex =
              slotOrder.indexOf(eventKey);

            const geometry =
              layout.slots[slotIndex];

            const visible =
              Boolean(geometry);

            return (
              <div
                key={eventKey}
                className={
                  visible
                    ? "absolute"
                    : "pointer-events-none absolute invisible"
                }
                style={
                  visible
                    ? {
                        left: `${geometry.x}%`,
                        top: `${geometry.y}%`,
                        width: `${geometry.w}%`,
                        height: `${geometry.h}%`,
                        transition:
                          "all 250ms ease",
                      }
                    : {
                        left: 0,
                        top: 0,
                        width: 1,
                        height: 1,
                      }
                }
              >
                <GamedayWidget
                  event={eventKey}
                  isDivisional={
                    isDivisional
                  }
                  registerLabel={(label) =>
                    registerLabel(
                      eventKey,
                      label
                    )
                  }
                  multiview={{
                    layoutKey:
                      selectedLayoutKey,
                    ...presentation,
                    slotIndex,
                    visible,
                  }}
                />
              </div>
            );
          })}

          {Array.from({
            length: emptySlotCount,
          }).map((_, index) => {
            const slotIndex =
              streams.length + index;

            const geometry =
              layout.slots[slotIndex];

            if (!geometry) {
              return null;
            }

            return (
              <button
                key={`empty-slot-${slotIndex}`}
                onClick={openEventPicker}
                className="absolute flex items-center justify-center border border-dashed border-neutral-700 bg-neutral-950/80 transition-colors hover:border-neutral-500 hover:bg-neutral-900"
                style={{
                  left: `${geometry.x}%`,
                  top: `${geometry.y}%`,
                  width: `${geometry.w}%`,
                  height: `${geometry.h}%`,
                }}
              >
                <div className="flex flex-col items-center gap-2 text-neutral-500">
                  <PlusIcon className="h-8 w-8" />

                  <span className="text-sm font-semibold">
                    Add Event
                  </span>

                  <span className="text-xs">
                    Choose an event for this tile
                  </span>
                </div>
              </button>
            );
          })}
        </main>
      </div>

      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          sidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[clamp(280px,25vw,400px)] border-l border-neutral-700 bg-neutral-900 p-3 shadow-xl transition-transform ${
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="mb-3 font-bold">
          Multiview
        </div>

        <div className="mb-4 space-y-1">
          {priority.map(
            (eventKey, position) => (
              <div
                key={eventKey}
                className="flex items-center justify-between rounded bg-neutral-800 px-2 py-1"
              >
                <span className="truncate text-xs">
                  {labels[eventKey] ??
                    `Stream ${position + 1}`}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      move(position, -1)
                    }
                    className="rounded bg-neutral-700 px-2 py-0.5 text-xs"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() =>
                      move(position, 1)
                    }
                    className="rounded bg-neutral-700 px-2 py-0.5 text-xs"
                  >
                    ↓
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="mb-1 font-bold">
          Layouts
        </div>

        {Object.entries(LAYOUTS).map(
          ([key, value]) => (
            <button
              key={key}
              onClick={() =>
                setLayoutKey(key)
              }
              className={`block w-full rounded px-2 py-1 text-left text-sm ${
                selectedLayoutKey === key
                  ? "bg-neutral-700"
                  : "hover:bg-neutral-800"
              }`}
            >
              {value.name}
            </button>
          )
        )}
      </aside>

      {eventPickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() =>
            setEventPickerOpen(false)
          }
        >
          <div
            className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="font-bold">
                Add Event
              </div>

              <button
                onClick={() =>
                  setEventPickerOpen(false)
                }
                className="icon-button"
                title="Close"
              >
                <XMarkIcon />
              </button>
            </div>

            <div className="border-b border-neutral-800 p-3">
              <input
                autoFocus
                type="text"
                value={eventSearch}
                onChange={(event) =>
                  setEventSearch(
                    event.target.value
                  )
                }
                placeholder="Search events..."
                className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div className="min-h-0 overflow-y-auto p-2">
              {eventsLoading ? (
                <div className="p-6 text-center text-sm text-neutral-500">
                  Loading events...
                </div>
              ) : filteredEvents.length ===
                0 ? (
                <div className="p-6 text-center text-sm text-neutral-500">
                  No matching events.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEvents.map(
                    (event) => (
                      <button
                        key={event.key}
                        onClick={() =>
                          addEvent(event)
                        }
                        className="w-full rounded px-3 py-2 text-left transition-colors hover:bg-neutral-800"
                      >
                        <div className="truncate text-sm font-semibold">
                          {event.name ??
                            event.short_name ??
                            event.key}
                        </div>

                        <div className="mt-0.5 flex gap-2 text-xs text-neutral-500">
                          <span>
                            {event.key}
                          </span>

                          {event.city && (
                            <span>
                              {event.city}
                              {event.state_prov
                                ? `, ${event.state_prov}`
                                : ""}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}