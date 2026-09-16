import crypto from "node:crypto";
import { tba as TBA } from "@/lib/tba";

type TBAWebhookMatch = { key?: string; event_key?: string; alliances?: Record<string,{teams?:string[]}> };
type TBAWebhookAward = { recipient_list?: Array<{team_number?:number|null}> };
type TBAWebhookData = { verification_key?:string; event_key?:string; event?:{key?:string}; team_key?:string; team_keys?:string[]; match_key?:string; match?:TBAWebhookMatch; awards?:TBAWebhookAward[] };
type TBAWebhookPayload = { message_type?:string; message_data?:TBAWebhookData };

function verifyWebhook(payload:string,signature:string|null){const secret=process.env.TBA_WEBHOOK_TOKEN;if(!secret||!signature)return false;const expected=crypto.createHmac("sha256",secret).update(payload).digest("hex");const expectedBuffer=Buffer.from(expected,"utf8");const signatureBuffer=Buffer.from(signature,"utf8");if(expectedBuffer.length!==signatureBuffer.length)return false;return crypto.timingSafeEqual(expectedBuffer,signatureBuffer);}

export async function POST(req:Request){
 const payloadText=await req.text(); const signature=req.headers.get("X-TBA-HMAC");
 if(!verifyWebhook(payloadText,signature)){console.warn("[WEBHOOK][TBA] Invalid HMAC");return new Response("Unauthorized",{status:401});}
 let payload:TBAWebhookPayload;
 try{payload=JSON.parse(payloadText) as TBAWebhookPayload;}catch{return new Response("Invalid JSON",{status:400});}
 const type=payload.message_type; const data=payload.message_data; const eventKey=data?.event_key??data?.event?.key??data?.match?.event_key;
 console.log(`[WEBHOOK][TBA] Received ${type}`);
 switch(type){
  case "upcoming_match": case "match_score": case "match_video": { const matchKey=data?.match_key??data?.match?.key; const teamKeys=new Set<string>(data?.team_keys??[]); if(data?.team_key)teamKeys.add(data.team_key); for(const alliance of Object.values(data?.match?.alliances??{})){for(const teamKey of alliance.teams??[])teamKeys.add(teamKey);} const tags:string[]=[]; if(matchKey)tags.push(`match:${matchKey}`); if(eventKey)tags.push(`event:${eventKey}:matches`); if(eventKey)for(const teamKey of teamKeys)tags.push(`team:${teamKey}:event:${eventKey}:matches`); await TBA.invalidateTags(tags); break; }
  case "schedule_updated": case "starting_comp_level": if(eventKey)await TBA.invalidateTag(`event:${eventKey}:matches`); break;
  case "alliance_selection": { if(eventKey)await TBA.invalidateTags([`event:${eventKey}:alliances`,`event:${eventKey}:rankings`,`event:${eventKey}:statuses`]); if(eventKey&&data?.team_key)await TBA.invalidateTag(`team:${data.team_key}:event:${eventKey}`); break; }
  case "awards_posted": { if(eventKey)await TBA.invalidateTag(`event:${eventKey}:awards`); const teamKeys=new Set<string>(); if(data?.team_key)teamKeys.add(data.team_key); for(const award of data?.awards??[])for(const recipient of award.recipient_list??[])if(recipient.team_number!=null)teamKeys.add(`frc${recipient.team_number}`); if(eventKey)await TBA.invalidateTags([...teamKeys].map(teamKey=>`team:${teamKey}:event:${eventKey}:awards`)); break; }
  case "verification": console.log(`[WEBHOOK][TBA] Received Webhook Verification Code ${data?.verification_key ?? ""}`); break;
  case "ping": case "broadcast": break;
  default: console.log(`[WEBHOOK][TBA] Ignoring unknown message type: ${type}`); break;
 }
 return Response.json({ok:true});
}
