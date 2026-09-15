import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
    const payload = await req.json();
    console.log('[WEBHOOK][Nexus] Received payload', { payload });
    return new Response("ok", { status: 200 });
}