"use client";

import { useParams, useSearchParams } from "next/navigation";
import GamedayWidget from "@/components/gameday/GamedayWidget";

export default function GamedayPage() {
  const { event } = useParams();
  const searchParams = useSearchParams();
  const teams = searchParams.getAll("team");
  return <div className="h-screen bg-black"><GamedayWidget event={event} initialTeams={teams} isDivisional={false} /></div>;
}
