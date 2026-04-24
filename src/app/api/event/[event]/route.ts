import { TBA } from "@/lib/tbaService";
export const revalidate = 15000;

export const GET = async (_req: any, { params }: any) => {
  const event = params?.event;

  if (!event) {
    return new Response("Missing event key", { status: 400 });
  }

  const data = await TBA.getEvent(event);

  return Response.json(data);
};