"use client";
import { useState } from "react";
export default function CastButton({ onCast, disabled=false }) { const [busy,setBusy]=useState(false); return <button disabled={disabled||busy} onClick={async()=>{setBusy(true);try{await onCast?.()}finally{setBusy(false)}}} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-40">{busy?"Casting…":"Cast"}</button>; }
