"use client";

import { useEffect, useState } from "react";
import MultiviewClient from "@/components/multiview/MultiviewClient";
import GamedayWidget from "@/components/gameday/GamedayWidget";

// ==============================
// HELPERS
// ==============================
function normalizeTeams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

// ==============================
// COMPONENT
// ==============================
export default function DivisionalEvent({ params, searchParams }) {
  const [parent, setParent] = useState(null);
  const [divisionKeys, setDivisionKeys] = useState([]);
  const [teams, setTeams] = useState([]);
  const [parentEvent, setParentEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==============================
  // UNWRAP PARAMS + LOAD DATA
  // ==============================
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);

        // ✅ unwrap both promises
        const resolvedParams = await params;
        const resolvedSearchParams = await searchParams;

        const parentKey = resolvedParams?.parentEvent;
        const parsedTeams = normalizeTeams(resolvedSearchParams?.team);

        if (cancelled) return;

        setTeams(parsedTeams);
        setParentEvent(parentKey);

        // fetch parent event
        const res = await fetch(`/api/event/${parentKey}`);
        const parentData = await res.json();

        if (cancelled) return;

        setParent(parentData);
        setDivisionKeys(parentData?.division_keys || []);
      } catch (err) {
        console.error("Failed to load divisional event:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [params, searchParams]);

  // ==============================
  // LOADING
  // ==============================
  if (loading || !parentEvent) {
    return <div className="p-4 text-white">Loading events...</div>;
  }

  // ==============================
  // RENDER
  // ==============================
  return (
    <MultiviewClient isDivisional={true} parentEvent={parent}>
      {/* Divisions */}
      {divisionKeys.map((key) => (
        <GamedayWidget
          key={key}
          event={key}
          initialTeams={teams}
          isDivisional={true}
        />
      ))}

      {/* Parent */}
      <GamedayWidget
        key={parentEvent}
        event={parentEvent}
        initialTeams={teams}
        isDivisional={true}
      />
    </MultiviewClient>
  );
}