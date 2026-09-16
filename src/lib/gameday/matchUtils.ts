import type { TBAMatch } from "@/lib/tba/types";
export function isPlayed(match: TBAMatch) { return Boolean(match.actual_time); }
export function matchTime(match: TBAMatch) { return match.predicted_time ?? match.time ?? Infinity; }
export function sortMatches(matches: TBAMatch[]) { return [...matches].sort((a,b)=>matchTime(a)-matchTime(b)); }
export function getNextMatch(matches: TBAMatch[]) { const now=Date.now()/1000; return matches.find(m=>!isPlayed(m)&&matchTime(m)>=now) ?? matches.find(m=>!isPlayed(m)) ?? null; }
export function getLastMatch(matches: TBAMatch[]) { return matches.reduce<TBAMatch|null>((latest,m)=>{ if(!isPlayed(m)) return latest; if(!latest || (m.actual_time??0)>(latest.actual_time??0)) return m; return latest; },null); }
export function getMatchesForTeams(matches: TBAMatch[],teams:string[]) { if(!teams.length)return matches; const wanted=new Set(teams.map(String)); return matches.filter(m=>[...(m.alliances.red.team_keys??[]),...(m.alliances.blue.team_keys??[])].some(t=>wanted.has(String(t)))); }
export function compactMatchLabel(match: TBAMatch|null) { if(!match)return null; const level=String(match.comp_level??"").toLowerCase(); const number=match.match_number??""; const set=match.set_number; if(level==="qm")return `Q${number}`; if(["ef","qf","sf"].includes(level))return set!=null?`${level.toUpperCase()}${set}-${number}`:`${level.toUpperCase()}${number}`; if(level==="f")return `F${number}`; return level?`${level.toUpperCase()}${number}`:null; }
