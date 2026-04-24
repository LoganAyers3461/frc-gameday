import { unstable_cache } from "next/cache";
import { TBA } from "@/lib/tbaService";

function makeKey(event: string, type: string) {
  return `${event}:${type}`;
}

// CORE IDEA: cache per event + data type
export const getEventData = (event: string, type: string, revalidate:number = 30, fn: () => Promise<any>) => {
    const key = makeKey(event, type)
    return unstable_cache(
        async () => {
            console.log("Unstable Cache MISS:", key);
            return fn();
        }, [key],
        { revalidate }
    )();
};