import { unstable_cache } from "next/cache";

function makeKey(event: string, type: string) {
  return `${event}:${type}`;
}

export const getEventData = (
  event: string,
  type: string,
  revalidate: number = 30,
  fn: () => Promise<any>
) => {
  const key = makeKey(event, type);

  return unstable_cache(
    async () => {
      console.log("Unstable Cache MISS:", key);
      return fn();
    },
    [key],
    {
      revalidate,
      tags: [`tba:${event}:${type}`],
    }
  )();
};