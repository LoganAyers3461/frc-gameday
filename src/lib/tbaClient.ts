const BASE_URL = "https://www.thebluealliance.com/api/v3";

const etagCache = new Map<string, string>();
const memoryCache = new Map<string, any>();

export class TBAClient {
  constructor(private authKey: string) {}
  async get(endpoint: string, revalidate = 30, options?: { noStore?: boolean }) {
    console.log(`[TBA Client] Fetching ${endpoint} with revalidate=${revalidate} and noStore=${options?.noStore || false}`);
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-TBA-Auth-Key": this.authKey,
      },
      ...(options?.noStore
        ? { cache: "no-store" }
        : { next: { revalidate } }),
    });

    if (!res.ok) {
      throw new Error(`[TBA Client] ERROR ${endpoint} ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }
}