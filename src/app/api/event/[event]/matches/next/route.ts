import { getEventState } from "@/lib/eventState";

export async function GET(_: Request, { params }: any) {
  const { event } = await params;

  const state: any = await getEventState(event);

  const next = state?.nextMatch;

  return Response.json({ next });
}