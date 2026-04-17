import { TBA } from "@/lib/tbaService";

export async function GET(
  _: Request,
  { params }: { params: { team: string } }
) {
  const events = await TBA.getTeamEvents(params.team, new Date().getFullYear());
  return Response.json(events);
}