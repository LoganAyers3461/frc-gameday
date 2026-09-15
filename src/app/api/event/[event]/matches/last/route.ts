import { TBA } from "@/lib/tbaService";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ event: string }> }
) {
    const { event } = await params;

    if (!event) {
        return new Response("Missing event key", {
            status: 400,
        });
    }

    try {
        const lastMatch = await TBA.getLastMatch(event);

        return Response.json({ lastMatch });
    } catch (err) {
        console.error("[Route][TBA] Could not get last match", err);

        return Response.json(
            { error: "Failed to load last match" },
            { status: 500 }
        );
    }
}