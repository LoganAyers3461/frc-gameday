"use client";

import { useEffect } from "react";

export default function StreamModal({ open, setOpen, streams = [], activeKey, setActiveKey }) {
  useEffect(() => {
    if (!open) return;
    const close = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, setOpen]);

  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
    <div className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><div className="font-semibold">Webcasts</div><div className="text-xs text-neutral-500">{streams.length} available</div></div><button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white">Close</button></div>
      <div className="max-h-[65vh] overflow-y-auto p-2">
        {streams.length ? streams.map((stream) => <button key={stream.key} onClick={() => { setActiveKey(stream.key); setOpen(false); }} className={`w-full rounded-lg p-3 text-left ${stream.key === activeKey ? "bg-white text-black" : "hover:bg-white/5"}`}><div className="text-sm font-medium">{stream.meta?.title || `${stream.type === "youtube" ? "YouTube" : "Twitch"} webcast`}</div><div className="mt-1 text-xs opacity-60">{stream.date || "Date not specified"}</div></button>) : <div className="p-6 text-center text-sm text-neutral-500">No supported webcasts have been published.</div>}
      </div>
    </div>
  </div>;
}
