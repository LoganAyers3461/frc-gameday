import { TBA } from "@/lib/tbaService";
export async function GET(
  req: Request,
) {
  const year = new Date().getFullYear();

  const data = await TBA.getDistricts(year);

  return Response.json(data);
}