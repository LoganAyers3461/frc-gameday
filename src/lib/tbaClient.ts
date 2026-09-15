const BASE_URL = "https://www.thebluealliance.com/api/v3";

import { redis } from "@/lib/redis";

type CacheEntry = {
    data: unknown;
    etag: string | null;
    expiresAt: number;
};

function norm(endpoint: string) {
    return endpoint.replace(/\//g, ":");
}

function cacheKey(endpoint: string) {
    return `cache${norm(endpoint)}`;
}

function tagKey(tag: string) {
    return `tag:${tag}`;
}

function deriveTags(endpoint: string): string[] {
    const parts = endpoint.split("/").filter(Boolean);

    const tags: string[] = [];

    const eventIdx = parts.indexOf("event");

    if (eventIdx !== -1 && parts[eventIdx + 1]) {
        const eventKey = parts[eventIdx + 1];

        tags.push(`event:${eventKey}`);

        if (parts[eventIdx + 2]) {
            tags.push(`event:${eventKey}:${parts[eventIdx + 2]}`);
        }
    }

    const teamIdx = parts.indexOf("team");

    if (teamIdx !== -1 && parts[teamIdx + 1]) {
        tags.push(`team:${parts[teamIdx + 1]}`);
    }

    return tags;
}

function getMaxAge(cacheControl: string | null): number | null {
    if (!cacheControl) return null;

    const match = cacheControl.match(
        /(?:^|,)\s*max-age\s*=\s*"?(\d+)"?/i
    );

    return match ? Number(match[1]) : null;
}

function getExpiresAt(cacheControl: string | null): number {
    const maxAge = getMaxAge(cacheControl);

    if (maxAge === null) {
        /*
         * No Cache-Control max-age means we don't know how
         * long TBA considers this representation fresh.
         *
         * Do not invent a TTL here.
         */
        return Date.now();
    }

    return Date.now() + maxAge * 1000;
}

export class TBAClient {
    constructor(private authKey: string) {}

    async invalidateTag(tag: string) {
        const key = tagKey(tag);

        const members = await redis.smembers(key);

        if (!members?.length) return;

        const pipeline = redis.pipeline();

        for (const cache of members) {
            pipeline.del(cache);
        }

        pipeline.del(key);

        await pipeline.exec();

        console.log(`[TBA][Client] invalidated tag ${tag}`);
    }

    async get(
        endpoint: string,
        options?: {
            forceRefresh?: boolean;
        }
    ) {
        const cKey = cacheKey(endpoint);
        const tags = deriveTags(endpoint);

        /*
         * Redis is the only application cache.
         */
        const cachedRaw = await redis.get(cKey);

        let cached: CacheEntry | null = null;

        if (cachedRaw) {
            try {
                cached = JSON.parse(cachedRaw);
            } catch {
                console.warn(
                    `[TBA][Client] invalid cache entry for ${endpoint}`
                );

                await redis.del(cKey);
            }
        }

        /*
         * Fresh Redis data requires no request to TBA.
         */
        if (
            cached &&
            !options?.forceRefresh &&
            Date.now() < cached.expiresAt
        ) {
            console.log(`[TBA][Client] Redis cache hit for ${endpoint}`);

            return cached.data;
        }

        /*
         * Redis entry is missing or stale.
         *
         * If we have an ETag, ask TBA whether our stale
         * representation is still current.
         */
        const headers: Record<string, string> = {
            "X-TBA-Auth-Key": this.authKey,
        };

        if (cached?.etag && !options?.forceRefresh) {
            headers["If-None-Match"] = cached.etag;

            console.log(
                `[TBA][Client] validating cached entry for ${endpoint}`
            );
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers,
            cache: "no-store",
        });

        /*
         * TBA says our cached representation is still current.
         */
        if (res.status === 304) {
            if (!cached) {
                throw new Error(
                    `[TBA][Client] received 304 without Redis cache for ${endpoint}`
                );
            }

            const refreshed: CacheEntry = {
                ...cached,
                expiresAt: getExpiresAt(
                    res.headers.get("Cache-Control")
                ),
            };

            await redis.set(
                cKey,
                JSON.stringify(refreshed)
            );

            console.log(
                `[TBA][Client] 304 Not Modified for ${endpoint}`
            );

            return cached.data;
        }

        /*
         * TBA returned a new representation.
         */
        if (res.ok) {
            const data = await res.json();

            const entry: CacheEntry = {
                data,
                etag: res.headers.get("ETag"),
                expiresAt: getExpiresAt(
                    res.headers.get("Cache-Control")
                ),
            };

            await redis.set(
                cKey,
                JSON.stringify(entry)
            );

            /*
             * Register this cache entry with its invalidation tags.
             */
            if (tags.length) {
                const pipeline = redis.pipeline();

                for (const tag of tags) {
                    pipeline.sadd(
                        tagKey(tag),
                        cKey
                    );
                }

                await pipeline.exec();
            }

            console.log(
                `[TBA][Client] Redis cache updated for ${endpoint}`
            );

            return data;
        }

        throw new Error(
            `[TBA][Client] ERROR ${endpoint} ${res.status}`
        );
    }
}