"use client";

import { useGameday } from "@/components/gameday/hooks/useGameday";

export default function ChatView({ data }) {

  if (!data?.streams?.[0]?.chat) return null;

  return (
    <iframe
      className="w-full h-full bg-black"
      src={data.streams[0].chat}
    />
  );
}