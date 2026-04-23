import { TBA } from "@/lib/tbaService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event: event } = await params;

  const data = await TBA.getEventTeamsStatuses(event);

  return Response.json(data);
}