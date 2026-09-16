"use client";

import { useEffect, useState } from "react";
import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";

function normalizeParams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export default function GamedayPage({ searchParams }) {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Next.js 16 may provide searchParams as a Promise.
        const params =
          searchParams && typeof searchParams.then === "function"
            ? await searchParams
            : searchParams ?? {};

        const eventKeys = normalizeParams(params.event);
        const teamKeys = normalizeParams(params.team);

        if (cancelled) return;

        setTeams(teamKeys);

        // /gameday without ?event=... intentionally renders nothing.
        if (!eventKeys.length) {
          setEvents([]);
          return;
        }

        const results = await Promise.all(
          eventKeys.map(async (key) => {
            const res = await fetch(`/api/event/${key}`, {
              cache: "no-store",
            });

            if (!res.ok) {
              throw new Error(`Failed to load ${key}`);
            }

            return res.json();
          })
        );

        if (!cancelled) {
          setEvents(results);
        }
      } catch (err) {
        console.error("Gameday event load error:", err);

        if (!cancelled) {
          setEvents([]);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (!loading && !events.length && !error) {
    return <EmptyState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load events"
        detail={error.message}
      />
    );
  }

  if (loading || !events.length) {
    return <EmptyState title="Loading events…" />;
  }

  return (
    <MultiviewClient isDivisional={false}>
      {events.map((event) => (
        <GamedayWidget
          key={event.key}
          event={event.key}
          initialTeams={teams}
          isDivisional={false}
        />
      ))}
    </MultiviewClient>
  );
}

function EmptyState({
  title = "No events selected",
  detail = "Choose an event from the FieldView home page.",
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md text-center">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 text-sm text-neutral-500">{detail}</div>
      </div>
    </div>
  );
}