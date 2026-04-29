import { getEventData } from "@/lib/tbaEventCache";
import { TBA } from "@/lib/tbaService";

export const revalidate = 30; // revalidate every 30 seconds
export const GET = async (req: Request,
  { params }: { params: Promise<{ event: string }> }) => {
  const { event: event } = await params;

  if (!event) {
    return new Response("Missing event key", { status: 400 });
  }


  const data = await getEventData(event, "matches", revalidate, () =>
    TBA.getEventMatches(event)
  );
  return Response.json(data);
};