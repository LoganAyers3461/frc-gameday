import { TBA } from "@/lib/tbaService";
import type { TBAEvent } from "@/lib/tba/types";

type EventState = "upcoming" | "in_progress" | "complete";
type ActiveEvent = Pick<TBAEvent,"key"|"name"|"short_name"|"event_type_string"|"city"|"state_prov"|"country"|"start_date"|"end_date"> & { state: EventState; flags: { hasDivisions:boolean; isPastStart:boolean } };

function getEventState(event:TBAEvent):EventState { const now=new Date(); const start=new Date(event.start_date); const end=new Date(event.end_date); if(now>end)return "complete"; if(now<start)return "upcoming"; return "in_progress"; }
function getEventWeight(event:ActiveEvent):number { return (event.flags.hasDivisions?1000:0)+(event.flags.isPastStart?10:0); }

export async function GET(){
 try{
  const events=await TBA.getEvents(new Date().getFullYear()); const today=new Date(); today.setHours(0,0,0,0);
  const filteredEvents=events.filter((event)=>{const [sy,sm,sd]=event.start_date.split("-").map(Number);const [ey,em,ed]=event.end_date.split("-").map(Number);const start=new Date(sy,sm-1,sd);const end=new Date(ey,em-1,ed);return start>=today||(start<=today&&end>=today);});
  const now=new Date(); const enriched:ActiveEvent[]=filteredEvents.map(event=>({key:event.key,name:event.name,short_name:event.short_name,event_type_string:event.event_type_string,city:event.city,state_prov:event.state_prov,country:event.country,start_date:event.start_date,end_date:event.end_date,state:getEventState(event),flags:{hasDivisions:(event.division_keys?.length??0)>0,isPastStart:new Date(event.start_date)<=now}}));
  const stateOrder:Record<EventState,number>={in_progress:0,upcoming:1,complete:2};
  enriched.sort((a,b)=>stateOrder[a.state]-stateOrder[b.state]||new Date(a.start_date).getTime()-new Date(b.start_date).getTime()||getEventWeight(b)-getEventWeight(a));
  return Response.json(enriched);
 }catch(error){console.error("Failed to fetch active events:",error);return Response.json([],{status:200});}
}
