"use client";

import { useEffect, useState } from "react";
import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";

export default function DivisionalEvent({ params, searchParams }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([params, searchParams]).then(async ([p, sp]) => {
      const key = p.parentEvent;
      const res = await fetch(`/api/event/${key}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const parent = await res.json();
      const teams = Array.isArray(sp?.team) ? sp.team : sp?.team ? [sp.team] : [];
      if (!cancelled) setData({ parent, teams });
    }).catch(() => !cancelled && setError(true));
    return () => { cancelled = true; };
  }, [params, searchParams]);

  if (error) return <div className="flex h-screen items-center justify-center bg-black text-sm text-neutral-500">Championship event not found.</div>;
  if (!data) return <div className="flex h-screen items-center justify-center bg-black text-sm text-neutral-500">Loading championship…</div>;

  const divisions = data.parent?.division_keys || [];
  const events = [...divisions, data.parent.key];
  return <MultiviewClient isDivisional parentEvent={data.parent}>{events.map((key) => <GamedayWidget key={key} event={key} initialTeams={data.teams} isDivisional />)}</MultiviewClient>;
}
