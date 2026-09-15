import { redis } from "@/lib/redis";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ event: string }> }
) {
    const { event } = await params;
    const redisKey = `nexus:event:${event}`;

    const data = await redis.get(redisKey);

    if (!data) {
        return new Response("Nexus data not found", { status: 404 });
    }

    const payload = JSON.parse(data);
    const etag = `"${payload.dataAsOfTime}"`;

    if (req.headers.get("if-none-match") === etag) {
        return new Response(null, {
            status: 304,
            headers: {
                ETag: etag,
            },
        });
    }

    return Response.json(payload, {
        headers: {
            ETag: etag,
            "Cache-Control": "no-cache",
        },
    });
}