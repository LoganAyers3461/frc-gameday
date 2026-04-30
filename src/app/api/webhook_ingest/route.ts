import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const body = await req.json();

  const { message_type, message_data } = body;

  if (message_type === "match_score") {
    const eventKey = message_data.event_key;

    revalidateTag(`tba:matches:${eventKey}`, "tag");
    revalidateTag(`tba:event:${eventKey}`, "tag");
  }

  if (message_type === "upcoming_match") {
    const eventKey = message_data.event_key;

    revalidateTag(`tba:event:${eventKey}`, "tag");
  }

  return new Response("ok");
}