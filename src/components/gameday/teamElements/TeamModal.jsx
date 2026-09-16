"use client";

import { useEffect, useMemo, useState } from "react";
import Rank from "./Rank";
import Record from "./Record";

export default function TeamModal({ open, setOpen, teams = [], teamsStatuses = {}, activeTeam = [], addTrackedTeam, removeTrackedTeam }) {
  const [search, setSearch] = useState("");
  useEffect(() => { if (!open) return; setSearch(""); const close = (e) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [open, setOpen]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...teams].sort((a, b) => a.team_number - b.team_number).filter((team) => !q || [team.team_number, team.nickname, team.city, team.state_prov, team.country].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [teams, search]);
  if (!open) return null;

  return <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal-panel max-w-xl" onMouseDown={(e) => e.stopPropagation()}><div className="border-b border-white/10 p-4"><div className="flex items-center justify-between"><div><div className="font-semibold">Follow teams</div><div className="text-xs text-neutral-500">{activeTeam.length ? `${activeTeam.length} selected` : "Showing the full event"}</div></div><button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white">Close</button></div><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, team name, city…" className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-neutral-600" /></div><div className="border-b border-white/10 p-2"><button onClick={() => { activeTeam.forEach(removeTrackedTeam); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold ${!activeTeam.length ? "bg-white text-black" : "hover:bg-white/5"}`}>All teams</button></div><div className="max-h-[60vh] overflow-y-auto p-2">{filtered.map((team) => { const selected = activeTeam.includes(team.key); const status = teamsStatuses?.[team.key]; return <button key={team.key} onClick={() => selected ? removeTrackedTeam(team.key) : addTrackedTeam(team.key)} className={`mb-1 w-full rounded-xl border p-3 text-left ${selected ? "border-white bg-white text-black" : "border-white/5 bg-white/[0.025] hover:bg-white/[0.06]"}`}><div className="flex items-center gap-3"><span className="font-mono text-sm font-bold">{team.team_number}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{team.nickname || "Unknown team"}</span>{selected && <span className="text-[10px] font-bold uppercase">Following</span>}</div><div className="mt-1 flex flex-wrap gap-x-3 text-[10px] opacity-60"><Rank status={status} /><Record status={status} /><span>{[team.city, team.state_prov, team.country].filter(Boolean).join(", ")}</span></div></button>})}</div></div></div>;
}
