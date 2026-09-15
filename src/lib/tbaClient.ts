const BASE_URL = "https://www.thebluealliance.com/api/v3";

import { redis } from "@/lib/redis";

type CacheEntry = {
    data: unknown;
    etag: string | null;
};

function norm(endpoint: string) {
    return endpoint.replace(/\//g, ":");
}

function cacheKey(endpoint: string) {
    return `cache${norm(endpoint)}`;
}

function etagKey(endpoint: string) {
    return `etag${norm(endpoint)}`;
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

            const endpoint = cache.replace(/^cache/, "");
            pipeline.del(etagKey(endpoint));
        }

        pipeline.del(key);

        await pipeline.exec();

        console.log(
            `[TBA][Client] invalidated tag ${tag}`
        );
    }

    async get(
        endpoint: string,
        options?: {
            forceRefresh?: boolean;
        }
    ) {
        const cKey = cacheKey(endpoint);
        const eKey = etagKey(endpoint);
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
                    `[TBA][Client] invalid cache entry for ${endpoint}`
                );

                await redis.del(cKey);
            }
        }

        /*
         * If Redis has the entry, its TTL has not expired.
         *
         * Therefore the cached data is still within the
         * freshness period provided by TBA.
         */
        if (cached && !options?.forceRefresh) {
            console.log(
                `[TBA][Client] Redis cache hit for ${endpoint}`
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
         * Use the stored ETag when validating an expired
         * Redis entry.
         */
        const etag = await redis.get(eKey);

        if (etag && !options?.forceRefresh) {
            headers["If-None-Match"] = etag;

            console.log(
                `[TBA][Client] validating cached entry for ${endpoint}`
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
                    `[TBA][Client] received 304 without Redis cache for ${endpoint}`
                );
            }

            const maxAge = getMaxAge(
                res.headers.get("Cache-Control")
            );

            if (maxAge === null) {
                throw new Error(
                    `[TBA][Client] 304 response for ${endpoint} did not provide Cache-Control max-age`
                );
            }

            /*
             * The data has not changed.
             *
             * Re-store it with TBA's newly supplied TTL.
             */
            await redis.set(
                cKey,
                JSON.stringify(cached),
                "EX",
                maxAge
            );

            console.log(
                `[TBA][Client] 304 Not Modified for ${endpoint}; TTL ${maxAge}s`
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
                    `[TBA][Client] response for ${endpoint} did not provide Cache-Control max-age`
                );
            }

            const newEtag = res.headers.get("ETag");

            const entry: CacheEntry = {
                data,
                etag: newEtag,
            };

            /*
             * Redis TTL comes directly from TBA's
             * Cache-Control max-age.
             */
            await redis.set(
                cKey,
                JSON.stringify(entry),
                "EX",
                maxAge
            );

            /*
             * Keep the ETag separately so we can still
             * validate the representation after the cache
             * entry expires.
             */
            if (newEtag) {
                await redis.set(eKey, newEtag);
            }

            /*
             * Register the cache entry with its tags.
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
                `[TBA][Client] Redis cache updated for ${endpoint}; TTL ${maxAge}s`
            );

            return data;
        }

        throw new Error(
            `[TBA][Client] ERROR ${endpoint} ${res.status}`
        );
    }
}