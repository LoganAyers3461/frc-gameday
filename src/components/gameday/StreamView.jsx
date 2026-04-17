"use client";

import { useGameday } from "@/components/gameday/hooks/useGameday";

export default function StreamView({ data }) {
  const stream = data?.streams?.[0]; // TODO: support multiple streams and let user choose

  if (!stream) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        No Stream Available
      </div>
    );
  }

  return (
    <iframe
      className="w-full h-full"
      src={stream.url}
      allow="autoplay; fullscreen"
    />
  );
}