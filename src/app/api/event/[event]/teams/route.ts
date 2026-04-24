import { TBA } from "@/lib/tbaService";

import { getEventData } from "@/lib/tbaEventCache";

export const revalidate = 15000;
export const GET = async (_req: any, { params }: any) => {
  const { event } = params;

  const data = await getEventData(event, "teams", () =>
    TBA.getTeamsAtEvent(event)
  );

  return Response.json(data);
};