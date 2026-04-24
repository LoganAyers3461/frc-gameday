import { getEventData } from "@/lib/tbaEventCache";
import { TBA } from "@/lib/tbaService";
export const revalidate = 90;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event: event } = await params;

  const data = await getEventData(event, "teams:statuses", revalidate, () =>
    TBA.getEventTeamsStatuses(event)
  );


  return Response.json(data);
}