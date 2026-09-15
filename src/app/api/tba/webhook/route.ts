import crypto from "node:crypto";

import { tba as TBA } from "@/lib/tba";

function verifyWebhook(
    payload: string,
    signature: string | null
) {
    const secret =
        process.env.TBA_WEBHOOK_TOKEN;

    if (!secret || !signature) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    const expectedBuffer =
        Buffer.from(expected, "utf8");

    const signatureBuffer =
        Buffer.from(signature, "utf8");

    if (
        expectedBuffer.length !==
        signatureBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        signatureBuffer
    );
}

export async function POST(req: Request) {
    const payloadText = await req.text();

    const signature =
        req.headers.get("X-TBA-HMAC");

    if (
        !verifyWebhook(
            payloadText,
            signature
        )
    ) {
        console.warn(
            "[WEBHOOK][TBA] Invalid HMAC"
        );

        return new Response(
            "Unauthorized",
            { status: 401 }
        );
    }

    let payload: any;

    try {
        payload = JSON.parse(payloadText);
    } catch {
        return new Response(
            "Invalid JSON",
            { status: 400 }
        );
    }

    const type = payload?.message_type;
    const data = payload?.message_data;

    console.log(
        `[WEBHOOK][TBA] Received ${type}`
    );

    const eventKey =
        data?.event_key ??
        data?.event?.key ??
        data?.match?.event_key;

    switch (type) {
        /*
         * --------------------------------------------------
         * Match changes
         * --------------------------------------------------
         *
         * These affect:
         *
         * - the individual match
         * - the event's match collection
         * - team/event match collections
         *
         * team_key is optional for event subscriptions, so
         * derive affected teams from the match object when
         * necessary.
         */

        case "upcoming_match":
        case "match_score":
        case "match_video": {
            const matchKey =
                data?.match_key ??
                data?.match?.key;

            const teamKeys = new Set<string>();

            if (data?.team_key) {
                teamKeys.add(data.team_key);
            }

            for (
                const teamKey of
                data?.team_keys ?? []
            ) {
                teamKeys.add(teamKey);
            }

            for (
                const alliance of
                Object.values(
                    data?.match?.alliances ?? {}
                ) as any[]
            ) {
                for (
                    const teamKey of
                    alliance?.teams ?? []
                ) {
                    teamKeys.add(teamKey);
                }
            }

            const tags: string[] = [];

            if (matchKey) {
                tags.push(
                    `match:${matchKey}`
                );
            }

            if (eventKey) {
                tags.push(
                    `event:${eventKey}:matches`
                );
            }

            if (eventKey) {
                for (
                    const teamKey of teamKeys
                ) {
                    tags.push(
                        `team:${teamKey}:event:${eventKey}:matches`
                    );
                }
            }

            await TBA.invalidateTags(tags);

            break;
        }

        /*
         * --------------------------------------------------
         * Schedule
         * --------------------------------------------------
         *
         * New unplayed matches have been added.
         */

        case "schedule_updated":
        case "starting_comp_level": {
            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:matches`
                );
            }

            break;
        }

        /*
         * --------------------------------------------------
         * Alliance selection
         * --------------------------------------------------
         */

        case "alliance_selection": {
            if (eventKey) {
                await TBA.invalidateTags([
                    `event:${eventKey}:alliances`,
                    `event:${eventKey}:rankings`,
                    `event:${eventKey}:statuses`,
                ]);
            }

            if (
                eventKey &&
                data?.team_key
            ) {
                await TBA.invalidateTag(
                    `team:${data.team_key}:event:${eventKey}`
                );
            }

            break;
        }

        /*
         * --------------------------------------------------
         * Awards
         * --------------------------------------------------
         */

        case "awards_posted": {
            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:awards`
                );
            }

            const teamKeys = new Set<string>();

            if (data?.team_key) {
                teamKeys.add(data.team_key);
            }

            for (
                const award of
                data?.awards ?? []
            ) {
                for (
                    const recipient of
                    award?.recipient_list ?? []
                ) {
                    if (
                        recipient?.team_number !=
                        null
                    ) {
                        teamKeys.add(
                            `frc${recipient.team_number}`
                        );
                    }
                }
            }

            if (eventKey) {
                await TBA.invalidateTags(
                    [...teamKeys].map(
                        (teamKey) =>
                            `team:${teamKey}:event:${eventKey}:awards`
                    )
                );
            }

            break;
        }

        /*
         * --------------------------------------------------
         * No cache invalidation required
         * --------------------------------------------------
         */

        case "verification":
            console.log(`[WEBHOOK][TBA] Recieved Webhook Verification Code ${payload}`)
        case "ping":
        case "broadcast":
            break;

        default:
            console.log(
                `[WEBHOOK][TBA] Ignoring unknown message type: ${type}`
            );
            break;
    }

    return Response.json({
        ok: true,
    });
}