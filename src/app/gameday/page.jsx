"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";

export default function GamedayPage() {
  const params = useSearchParams();
  const eventKeys = params.getAll("event");
  const teams = params.getAll("team");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!eventKeys.length) { setEvents([]); return; }
    Promise.all(eventKeys.map(async (key) => {
      const res = await fetch(`/api/event/${key}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${key}`);
      return res.json();
    })).then((data) => { if (!cancelled) { setEvents(data); setError(null); } }).catch((err) => { if (!cancelled) setError(err); });
    return () => { cancelled = true; };
  }, [params.toString()]);

  if (!eventKeys.length) return <EmptyState />;
  if (error) return <EmptyState title="Unable to load events" detail={error.message} />;
  if (!events.length) return <EmptyState title="Loading events…" />;

  return <MultiviewClient>{events.map((event) => <GamedayWidget key={event.key} event={event.key} initialTeams={teams} isDivisional={false} />)}</MultiviewClient>;
}

function EmptyState({ title = "No events selected", detail = "Choose an event from the FieldView home page." }) {
  return <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white"><div className="max-w-md text-center"><div className="text-lg font-semibold">{title}</div><div className="mt-2 text-sm text-neutral-500">{detail}</div></div></div>;
}
