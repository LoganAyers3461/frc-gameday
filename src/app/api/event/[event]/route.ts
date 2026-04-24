import { TBA } from "@/lib/tbaService";
export const revalidate = 15000;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event: event } = await params;

  const data = await TBA.getEvent(event);

  return Response.json(data);
}