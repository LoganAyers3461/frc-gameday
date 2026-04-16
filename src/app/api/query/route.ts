export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");

  if (!team) {
    return Response.json({ error: "Missing team" }, { status: 400 });
  }

  const res = await fetch(`https://www.thebluealliance.com/api/v3/team/${team}`, {
    headers: {
      Authorization: `Bearer ${process.env.TBA_API_KEY}`,
      "X-TBA-Auth-Key": process.env.TBA_API_KEY || "",
    },
  });

  const data = await res.json();
  return Response.json(data);
}