const BASE_URL = "https://www.thebluealliance.com/api/v3";

const etagCache = new Map<string, string>();
const memoryCache = new Map<string, any>();

export class TBAClient {
  constructor(private authKey: string) {}

  async get(endpoint: string, revalidate = 30) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-TBA-Auth-Key": this.authKey,
      },
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`[TBA Error] ${endpoint} ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }
}