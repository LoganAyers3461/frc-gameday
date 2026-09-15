import { redis } from "@/lib/redis";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ event: string }> }
) {
    const { event } = await params;
    const redisKey = `nexus:event:${event}`;

    const data = await redis.get(redisKey);

    if (!data) {
        return new Response("Nexus data not found", { status: 404 });
    }

    return Response.json(JSON.parse(data));
}