import {
  getEventState,
  setEventState,
  buildEventState,
} from "@/lib/eventState";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event } = await params;

  // 1. always try cached state
  let state:
    | { event: string; updatedAt: number; matches: any; nextMatch: any; lastMatch: any }
    | null = await getEventState(event) as { event: string; updatedAt: number; matches: any; nextMatch: any; lastMatch: any } | null;

  // 2. STRICT null check (not falsy)
  if (state == null) {
    console.log("[STATE MISS] hydrating event:", event);

    state = await buildEventState(event);

    // IMPORTANT: write-through cache
    await setEventState(event, state);
  }

  return Response.json(state, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}