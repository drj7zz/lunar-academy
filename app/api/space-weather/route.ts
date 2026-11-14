
import { getSpaceWeather } from "@/lib/spaceWeather";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSpaceWeather();

  return Response.json(data);
}
