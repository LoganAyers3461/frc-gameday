import crypto from "node:crypto";
import { tba as TBA } from "@/lib/tba";
import { broadcastTBAEvent } from "@/lib/websocket";

type TBAWebhookMatch = {
  key?: string;
  event_key?: string;
  alliances?: Record<
    string,
    {
      teams?: string[];
    }
  >;
};

type TBAWebhookAward = {
  recipient_list?: Array<{
    team_number?: number | null;
  }>;
};

type TBAWebhookData = {
  verification_key?: string;
  event_key?: string;
  event?: {
    key?: string;
  };
  team_key?: string;
  team_keys?: string[];
  match_key?: string;
  match?: TBAWebhookMatch & {
    [key: string]: unknown;
  };
  awards?: TBAWebhookAward[];
};

type TBAWebhookPayload = {
  message_type?: string;
  message_data?: TBAWebhookData;
};

function verifyWebhook(
  payload: string,
  signature: string | null,
) {
  const secret =
    process.env.TBA_WEBHOOK_TOKEN;

  if (!secret || !signature) {
    return false;
  }

  const expected =
    crypto
      .createHmac(
        "sha256",
        secret,
      )
      .update(payload)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8",
    );

  const signatureBuffer =
    Buffer.from(
      signature,
      "utf8",
    );

  if (
    expectedBuffer.length !==
    signatureBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    signatureBuffer,
  );
}

export async function POST(
  req: Request,
) {
  const payloadText =
    await req.text();

  const signature =
    req.headers.get(
      "X-TBA-HMAC",
    );

  if (
    !verifyWebhook(
      payloadText,
      signature,
    )
  ) {
    console.warn(
      "[WEBHOOK][TBA] Invalid HMAC",
    );

    return new Response(
      "Unauthorized",
      { status: 401 },
    );
  }

  let payload: TBAWebhookPayload;

  try {
    payload =
      JSON.parse(
        payloadText,
      ) as TBAWebhookPayload;
  } catch {
    return new Response(
      "Invalid JSON",
      { status: 400 },
    );
  }

  const type =
    payload.message_type;

  const data =
    payload.message_data;

  const eventKey =
    data?.event_key ??
    data?.event?.key ??
    data?.match?.event_key;

  console.log(
    `[WEBHOOK][TBA] Received ${type}`,
  );

  switch (type) {
    /*
     * These notifications contain a complete Match
     * object. Push that object directly into any
     * currently-existing Redis match caches.
     */
    case "match_score":
    case "match_video": {
      if (data?.match) {
        await TBA.mutateMatchCaches(
          data.match,
        );
      }

      break;
    }

    /*
     * upcoming_match does not contain a complete Match.
     *
     * Merge its timing/team information into existing
     * cached match representations.
     */
    case "upcoming_match": {
      await TBA.mutateUpcomingMatch(
        data ?? {},
      );

      break;
    }

    /*
     * These notifications do not contain the changed
     * match list itself, so there is nothing useful to
     * write directly into the matches cache.
     *
     * The websocket signal causes the client to refetch.
     */
    case "schedule_updated":
    case "starting_comp_level": {
      break;
    }

    /*
     * TBA gives us the updated Event object, but not
     * the alliance/ranking/status endpoints that our
     * clients consume.
     *
     * Keep the event cache current if it already exists,
     * then let the WSS signal trigger the derived-data
     * refetches.
     */
    case "alliance_selection": {
      if (data?.event && eventKey) {
        await TBA.replaceCached(
          `/event/${eventKey}`,
          data.event,
        );
      }

      break;
    }

    /*
     * awards_posted contains the actual awards, but our
     * current service does not expose an awards endpoint.
     *
     * For now this remains a refetch signal.
     */
    case "awards_posted": {
      break;
    }

    case "verification":
      console.log(
        `[WEBHOOK][TBA] Received Webhook Verification Code ${
          data?.verification_key ?? ""
        }`,
      );
      break;

    case "ping":
    case "broadcast":
      break;

    default:
      console.log(
        `[WEBHOOK][TBA] Ignoring unknown message type: ${type}`,
      );
      break;
  }

  /*
   * Redis is now updated BEFORE this signal is sent.
   *
   * Clients receiving the WSS event therefore refetch
   * against Redis and normally get the webhook-mutated
   * data without another request to TBA.
   */
  if (eventKey) {
    try {
      await broadcastTBAEvent(
        eventKey,
        type,
      );
    } catch (error) {
      console.error(
        "[WEBHOOK][TBA] Failed to broadcast WebSocket event:",
        error,
      );
    }
  }

  return Response.json({
    ok: true,
  });
}