"use client";

import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";
import { useEffect, useMemo, useState } from "react";

function normalizeParams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export default function Event({ searchParams }) {
  // searchParams may be an object OR promise depending on build/runtime
  const resolvedParams = useMemo(() => {
    if (!searchParams) return {};
    return typeof searchParams.then === "function"
      ? null
      : searchParams;
  }, [searchParams]);

  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // If searchParams is actually async in your runtime
        const sp = searchParams?.then
          ? await searchParams
          : searchParams;

        const teams = normalizeParams(sp?.team);
        const eventKeys = normalizeParams(sp?.event);
        setTeams(teams || [])

        if (!eventKeys.length) {
          setEvents([]);
          return;
        }
        const results = await Promise.all(
          eventKeys.map(async (key) => {
            const res = await fetch(`/api/event/${key}`);

            if (!res.ok) {
              throw new Error(`Failed to load event ${key}`);
            }

            return res.json();
          })
        );

        if (!cancelled) {
          setEvents(results);
        }
      } catch (err) {
        console.error("Event load error:", err);
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="p-4 text-white">
        Loading events...
      </div>
    );
  }

  return (
    <MultiviewClient isDivisional={false}>
      {events.map((event) => (
        <GamedayWidget
          key={event.key}
          event={event.key}
          initialTeams={teams}
          eventName={(data) => data || "Loading"}
          isDivisional={false}
        />
      ))}
    </MultiviewClient>
  );
}