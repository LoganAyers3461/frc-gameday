import { redis } from "@/lib/redis";

const BASE_URL = "https://www.thebluealliance.com/api/v3";

type CacheEntry<T> = {
  data: T;
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
  const tags = new Set<string>();

  const eventIdx = parts.indexOf("event");
  if (eventIdx !== -1 && parts[eventIdx + 1]) {
    const eventKey = parts[eventIdx + 1];
    tags.add(`event:${eventKey}`);
    if (parts[eventIdx + 2]) {
      tags.add(`event:${eventKey}:${parts[eventIdx + 2]}`);
    }
  }

  const teamIdx = parts.indexOf("team");
  if (teamIdx !== -1 && parts[teamIdx + 1]) {
    const teamKey = parts[teamIdx + 1];
    tags.add(`team:${teamKey}`);

    const teamEventIdx = teamIdx + 2;
    if (parts[teamEventIdx] === "event" && parts[teamEventIdx + 1]) {
      const eventKey = parts[teamEventIdx + 1];
      tags.add(`team:${teamKey}:event:${eventKey}`);
      if (parts[teamEventIdx + 2]) {
        tags.add(`team:${teamKey}:event:${eventKey}:${parts[teamEventIdx + 2]}`);
      }
    }
  }

  const matchIdx = parts.indexOf("match");
  if (matchIdx !== -1 && parts[matchIdx + 1]) {
    tags.add(`match:${parts[matchIdx + 1]}`);
  }

  return [...tags];
}

function getMaxAge(cacheControl: string | null): number | null {
  if (!cacheControl) return null;

  const match = cacheControl.match(/(?:^|,)\s*max-age\s*=\s*"?(\d+)"?/i);
  return match ? Number(match[1]) : null;
}

function parseCached<T>(raw: string): CacheEntry<T> | null {
  try {
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export class TBAClient {
  constructor(private readonly authKey: string) {}

  async invalidateTag(tag: string) {
    const key = tagKey(tag);
    const members = await redis.smembers(key);

    if (!members?.length) return;

    const pipeline = redis.pipeline();
    for (const cache of members) pipeline.del(cache);
    pipeline.del(key);
    await pipeline.exec();

    console.log(`[Client][TBA] invalidated tag ${tag} (${members.length} entries)`);
  }

  async invalidateTags(tags: string[]) {
    const uniqueTags = [...new Set(tags)];
    if (!uniqueTags.length) return;

    const pipeline = redis.pipeline();
    const cacheKeys = new Set<string>();
    const existingTagKeys: string[] = [];

    for (const tag of uniqueTags) {
      const key = tagKey(tag);
      const members = await redis.smembers(key);
      if (!members?.length) continue;

      existingTagKeys.push(key);
      for (const cache of members) cacheKeys.add(cache);
    }

    for (const cache of cacheKeys) pipeline.del(cache);
    for (const key of existingTagKeys) pipeline.del(key);

    if (cacheKeys.size || existingTagKeys.length) await pipeline.exec();

    console.log(
      `[Client][TBA] invalidated tags ${uniqueTags.join(", ")} (${cacheKeys.size} cache entries)`
    );
  }

  async get<T>(endpoint: string, options?: { forceRefresh?: boolean }): Promise<T> {
    const cKey = cacheKey(endpoint);
    const tags = deriveTags(endpoint);

    const cachedRaw = await redis.get(cKey);
    let cached: CacheEntry<T> | null = null;

    if (cachedRaw) {
      cached = parseCached<T>(cachedRaw);
      if (!cached) {
        console.warn(`[Client][TBA] invalid cache entry for ${endpoint}`);
        await redis.del(cKey);
      }
    }

    if (cached && !options?.forceRefresh && Date.now() < cached.expiresAt) {
      console.log(`[Client][TBA] Redis cache hit for ${endpoint}`);
      return cached.data;
    }

    const headers: Record<string, string> = {
      "X-TBA-Auth-Key": this.authKey,
    };

    if (cached?.etag && !options?.forceRefresh) {
      headers["If-None-Match"] = cached.etag;
      console.log(`[Client][TBA] validating cached entry for ${endpoint}`);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      cache: "no-store",
    });

    if (res.status === 304) {
      if (!cached) {
        throw new Error(`[Client][TBA] received 304 without Redis cache for ${endpoint}`);
      }

      const maxAge = getMaxAge(res.headers.get("Cache-Control"));
      if (maxAge === null) {
        throw new Error(`[Client][TBA] 304 response for ${endpoint} did not provide Cache-Control max-age`);
      }

      const refreshed: CacheEntry<T> = {
        ...cached,
        expiresAt: Date.now() + maxAge * 1000,
      };

      await redis.set(cKey, JSON.stringify(refreshed));
      console.log(`[Client][TBA] 304 Not Modified for ${endpoint}; freshness ${maxAge}s`);
      return cached.data;
    }

    if (!res.ok) {
      throw new Error(`[Client][TBA] ERROR ${endpoint} ${res.status}`);
    }

    const data = (await res.json()) as T;
    const maxAge = getMaxAge(res.headers.get("Cache-Control"));

    if (maxAge === null) {
      throw new Error(`[Client][TBA] response for ${endpoint} did not provide Cache-Control max-age`);
    }

    const entry: CacheEntry<T> = {
      data,
      etag: res.headers.get("ETag"),
      expiresAt: Date.now() + maxAge * 1000,
    };

    await redis.set(cKey, JSON.stringify(entry));

    if (tags.length) {
      const pipeline = redis.pipeline();
      for (const tag of tags) pipeline.sadd(tagKey(tag), cKey);
      await pipeline.exec();
    }

    console.log(`[Client][TBA] Redis cache updated for ${endpoint}; freshness ${maxAge}s`);
    return data;
  }
}
