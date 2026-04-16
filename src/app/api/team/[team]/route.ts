import { TBA } from "lib/tbaService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params;

  const data = await TBA.getTeam(team);

  return Response.json(data);
}