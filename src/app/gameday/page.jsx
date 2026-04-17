"use client";

import GamedayWidget from "@/components/gameday/GamedayWidget";

export default function GamedayPage() {
  const event = "2026necmp1"; // TODO: get from URL param
  const team = "frc10063"; // TODO: get from URL param

  return (
    <GamedayWidget event="2026necmp1" team="frc10063"/>
  );
}