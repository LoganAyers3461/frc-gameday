import { getEventData } from "@/lib/tbaEventCache";
import { TBA } from "@/lib/tbaService";
export const revalidate = 60;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event: event } = await params;

  const data = await getEventData(event, "playoffs:alliances", () =>
    TBA.getEventPlayoffAlliances(event)
  );

  return Response.json(data);
}