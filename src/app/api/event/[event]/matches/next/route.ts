import { TBA } from "@/lib/tbaService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event } = await params;

  if (!event) {
    return new Response("Missing Event Key", { status: 400 });
  }

  const matches = await TBA.getEventMatchesSimple(event);

  const now = Date.now() / 1000;

  const next =
    matches
      .filter((m: any) => m.actual_time === null)
      .map((m: any) => ({
        ...m,
        predicted_time: m.predicted_time ?? m.time ?? null,
      }))
      .filter((m: any) => m.predicted_time)
      .sort((a: any, b: any) => a.predicted_time - b.predicted_time)[0] ?? null;

  return Response.json(
    { next },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}