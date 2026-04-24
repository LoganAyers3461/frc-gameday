import { getEventData } from "@/lib/tbaEventCache";
import { TBA } from "@/lib/tbaService";

export const GET = async (_req: any, { params }: any) => {
  const { event } = params;

  const data = await getEventData(event, "matches", () =>
    TBA.getEventMatches(event)
  );
  return Response.json(data);
};