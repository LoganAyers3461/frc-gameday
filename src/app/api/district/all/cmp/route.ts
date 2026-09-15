import { TBA } from "@/lib/tbaService";

export async function GET() {
  const year = new Date().getFullYear();

  const data = await TBA.getAllDistrictTeamsAdvancedToCMP(year);

  return Response.json(data);
}