import { buildEventState, setEventState } from "@/lib/eventState";

export async function POST(req: Request) {
  const payload = await req.json();

  const eventKey = payload?.message_data?.event_key;
  const type = payload?.message_type;

  if (!eventKey) {
    return new Response("Missing event_key", { status: 400 });
  }

  // Only rebuild on relevant updates
  const relevant = new Set([
    "match_score",
    "upcoming_match",
    "schedule_updated",
  ]);

  if (!relevant.has(type)) {
    return Response.json({ ignored: true });
  }

  const state = await buildEventState(eventKey);

  await setEventState(eventKey, state);

  return Response.json({ ok: true });
}