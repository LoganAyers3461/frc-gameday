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
            tags.push(
                `event:${eventKey}:${parts[eventIdx + 2]}`
            );
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

        console.log(
            `[Client][TBA] invalidated tag ${tag}`
        );
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
         * --------------------------------------------------
         * Redis cache
         * --------------------------------------------------
         */

        const cachedRaw = await redis.get(cKey);

        let cached: CacheEntry | null = null;

        if (cachedRaw) {
            try {
                cached = JSON.parse(cachedRaw);
            } catch {
                console.warn(
                    `[Client][TBA] invalid cache entry for ${endpoint}`
                );

                await redis.del(cKey);
            }
        }

        /*
         * --------------------------------------------------
         * Fresh cache hit
         * --------------------------------------------------
         *
         * TBA's max-age determines expiresAt.
         *
         * The Redis key itself does NOT expire here because
         * stale data must remain available for ETag
         * validation.
         */

        if (
            cached &&
            !options?.forceRefresh &&
            Date.now() < cached.expiresAt
        ) {
            console.log(
                `[Client][TBA] Redis cache hit for ${endpoint}`
            );

            return cached.data;
        }

        /*
         * --------------------------------------------------
         * TBA request
         * --------------------------------------------------
         */

        const headers: Record<string, string> = {
            "X-TBA-Auth-Key": this.authKey,
        };

        /*
         * If stale data exists, validate it with TBA's ETag.
         */

        if (
            cached?.etag &&
            !options?.forceRefresh
        ) {
            headers["If-None-Match"] = cached.etag;

            console.log(
                `[Client][TBA] validating cached entry for ${endpoint}`
            );
        }

        const res = await fetch(
            `${BASE_URL}${endpoint}`,
            {
                headers,
                cache: "no-store",
            }
        );

        /*
         * --------------------------------------------------
         * 304 Not Modified
         * --------------------------------------------------
         */

        if (res.status === 304) {
            if (!cached) {
                throw new Error(
                    `[Client][TBA] received 304 without Redis cache for ${endpoint}`
                );
            }

            const maxAge = getMaxAge(
                res.headers.get("Cache-Control")
            );

            if (maxAge === null) {
                throw new Error(
                    `[Client][TBA] 304 response for ${endpoint} did not provide Cache-Control max-age`
                );
            }

            const refreshed: CacheEntry = {
                ...cached,
                expiresAt: Date.now() + maxAge * 1000,
            };

            await redis.set(
                cKey,
                JSON.stringify(refreshed)
            );

            console.log(
                `[Client][TBA] 304 Not Modified for ${endpoint}; freshness ${maxAge}s`
            );

            return cached.data;
        }

        /*
         * --------------------------------------------------
         * 200 OK
         * --------------------------------------------------
         */

        if (res.ok) {
            const data = await res.json();

            const maxAge = getMaxAge(
                res.headers.get("Cache-Control")
            );

            if (maxAge === null) {
                throw new Error(
                    `[Client][TBA] response for ${endpoint} did not provide Cache-Control max-age`
                );
            }

            const entry: CacheEntry = {
                data,
                etag: res.headers.get("ETag"),
                expiresAt: Date.now() + maxAge * 1000,
            };

            /*
             * No Redis TTL here.
             *
             * expiresAt controls freshness while the
             * representation remains available for
             * conditional validation.
             */

            await redis.set(
                cKey,
                JSON.stringify(entry)
            );

            /*
             * Register this cache entry with its tags.
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
                `[Client][TBA] Redis cache updated for ${endpoint}; freshness ${maxAge}s`
            );

            return data;
        }

        throw new Error(
            `[Client][TBA] ERROR ${endpoint} ${res.status}`
        );
    }
}