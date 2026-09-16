"use client";
import { useEffect, useState } from "react";
export default function NextMatchCountdown({ match }) { const [,setNow]=useState(Date.now()); useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000); return()=>window.clearInterval(id)},[]); if(!match?.predicted_time)return null; const seconds=Math.max(0,Math.round(match.predicted_time-Date.now()/1000)); const text=seconds<60?`${seconds}s`:`${Math.ceil(seconds/60)}m`; return <span className="tabular-nums">{text}</span>; }
