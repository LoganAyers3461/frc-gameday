const BASE_URL = "https://www.thebluealliance.com/api/v3";

export class TBAClient {
  constructor(private authKey: string) {
    if (!authKey) throw new Error("Missing TBA API key");
  }

  async get<T>(endpoint: string, revalidate = 3600): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-TBA-Auth-Key": this.authKey,
      },
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`TBA ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }
}