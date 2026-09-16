"use client";

export default function StreamView({ stream }) {
  if (!stream?.url) return null;
  if (stream.type === "youtube") return <iframe className="h-full w-full bg-black" src={`https://www.youtube.com/embed/${stream.channel}?autoplay=1&mute=1`} title="YouTube live stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  if (stream.type === "twitch") {
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return <iframe className="h-full w-full bg-black" src={`https://player.twitch.tv/?channel=${stream.channel}&parent=${parent}&muted=true`} title="Twitch live stream" allowFullScreen />;
  }
  return <div className="flex h-full items-center justify-center bg-neutral-950 text-sm text-neutral-500">Unsupported webcast type: {stream.type}</div>;
}
