"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { LAYOUTS, pickLayout } from "@/lib/layouts";
import EventLocalTime from "../gameday/navbar/EventLocalTime";

export default function MultiviewClient({ isDivisional=false, parentEvent=null, children=[] }) {
  const router=useRouter();
  const childArray=useMemo(()=>React.Children.toArray(children),[children]);
  const [layoutKey,setLayoutKey]=useState(null);
  const [activeIndex,setActiveIndex]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [order,setOrder]=useState(()=>childArray.map((_,i)=>i));
  const [labels,setLabels]=useState({});
  useEffect(()=>setOrder(childArray.map((_,i)=>i)),[childArray.length]);
  const selected=layoutKey??pickLayout(childArray.length||1);
  const layout=LAYOUTS[selected]??LAYOUTS.single;
  const presentation=layout.presentation??{teamTracker:"sides",matchInfo:"full"};
  const slotOrder=useMemo(()=>{if(activeIndex==null)return order;const next=order.filter(i=>i!==activeIndex);return [activeIndex,...next]},[activeIndex,order]);
  const register=(index,label)=>setLabels(current=>current[index]===label?current:{...current,[index]:label});
  const move=(index,direction)=>setOrder(current=>{const next=[...current];const target=index+direction;if(target<0||target>=next.length)return next;[next[index],next[target]]=[next[target],next[index]];return next});

  return <div className="flex h-screen w-screen overflow-hidden bg-black text-white"><div className="flex min-w-0 flex-1 flex-col"><header className="flex h-10 shrink-0 items-center justify-between border-b border-neutral-800 px-2"><div className="flex min-w-0 items-center gap-2"><button onClick={()=>router.push("/")} className="icon-button" title="Home"><HomeIcon/></button>{isDivisional&&parentEvent?<div className="min-w-0"><div className="truncate text-sm font-bold">{parentEvent.name}</div><div className="text-[10px] text-neutral-500"><EventLocalTime timezone={parentEvent.timezone}/></div></div>:<div><div className="text-sm font-bold">FieldView</div><div className="text-[10px] text-neutral-500">Powered by The Blue Alliance</div></div>}</div><div className="flex min-w-0 gap-1 overflow-hidden">{order.map(i=><button key={i} onClick={()=>setActiveIndex(v=>v===i?null:i)} className={`max-w-48 truncate rounded px-2 py-1 text-xs ${activeIndex===i?"ring-2 ring-white":"bg-neutral-800"}`}>{(labels[i]||`Stream ${i+1}`).replace("- FIRST Robotics Competition","")}</button>)}</div><button onClick={()=>setSidebarOpen(v=>!v)} className="icon-button" title="Multiview settings"><Squares2X2Icon/></button></header><main className="relative min-h-0 flex-1">{childArray.map((child,index)=>{const slot=slotOrder.indexOf(index);const geometry=layout.slots[slot];const visible=Boolean(geometry);return <div key={child?.key??index} className={visible?"absolute":"pointer-events-none absolute invisible"} style={visible?{left:`${geometry.x}%`,top:`${geometry.y}%`,width:`${geometry.w}%`,height:`${geometry.h}%`,transition:"all 250ms ease"}:{left:0,top:0,width:1,height:1}}>{React.cloneElement(child,{registerLabel:(label)=>register(index,label),multiview:{layoutKey:selected,...presentation,slotIndex:slot,visible}})}</div>})}</main></div><div onClick={()=>setSidebarOpen(false)} className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${sidebarOpen?"opacity-100":"pointer-events-none opacity-0"}`}/><aside className={`fixed right-0 top-0 z-50 h-full w-[clamp(280px,25vw,400px)] border-l border-neutral-700 bg-neutral-900 p-3 shadow-xl transition-transform ${sidebarOpen?"translate-x-0":"translate-x-full"}`}><div className="mb-3 font-bold">Multiview</div><div className="mb-4 space-y-1">{order.map((index,position)=><div key={index} className="flex items-center justify-between rounded bg-neutral-800 px-2 py-1"><span className="truncate text-xs">{labels[index]||`Stream ${index+1}`}</span><div className="flex gap-1"><button onClick={()=>move(position,-1)} className="rounded bg-neutral-700 px-2 py-0.5 text-xs">↑</button><button onClick={()=>move(position,1)} className="rounded bg-neutral-700 px-2 py-0.5 text-xs">↓</button></div></div>)}</div><div className="mb-1 font-bold">Layouts</div>{Object.entries(LAYOUTS).map(([key,value])=><button key={key} onClick={()=>setLayoutKey(key)} className={`block w-full rounded px-2 py-1 text-left text-sm ${selected===key?"bg-neutral-700":"hover:bg-neutral-800"}`}>{value.name}</button>)}</aside></div>;
}
