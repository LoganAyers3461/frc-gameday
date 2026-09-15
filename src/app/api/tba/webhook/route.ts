import { tba as TBA } from "@/lib/tba";

export async function POST(req: Request) {
    const payload = await req.json();

    const type = payload?.message_type;
    const data = payload?.message_data;

    switch (type) {
        case "match_score":
        case "match_video":
        case "upcoming_match": {
            const eventKey = data?.event_key;
            const matchKey =
                data?.match_key ??
                data?.match?.key;
            const teamKey = data?.team_key;

            if (matchKey) {
                await TBA.invalidateTag(
                    `match:${matchKey}`
                );
            }

            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:matches`
                );
            }

            if (teamKey) {
                await TBA.invalidateTag(
                    `team:${teamKey}`
                );
            }

            break;
        }

        case "schedule_updated":
        case "starting_comp_level": {
            const eventKey = data?.event_key;

            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:matches`
                );
            }

            break;
        }

        case "alliance_selection": {
            const eventKey = data?.event_key;

            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:alliances`
                );

                await TBA.invalidateTag(
                    `event:${eventKey}:rankings`
                );

                await TBA.invalidateTag(
                    `event:${eventKey}:statuses`
                );
            }

            break;
        }

        case "awards_posted": {
            const eventKey = data?.event_key;
            const teamKey = data?.team_key;

            if (eventKey) {
                await TBA.invalidateTag(
                    `event:${eventKey}:awards`
                );
            }

            if (teamKey) {
                await TBA.invalidateTag(
                    `team:${teamKey}`
                );
            }

            break;
        }

        case "verification":
        case "ping":
        case "broadcast":
            break;

        default:
            console.log(
                `[WEBHOOK][TBA] Ignoring ${type}`
            );
    }

    return Response.json({ ok: true });
}