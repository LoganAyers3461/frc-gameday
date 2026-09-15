import { useCallback, useEffect, useRef, useState } from "react";
import { NexusData, NexusMatch } from "@/lib/nexus/types";

export function useNexus(eventKey: string | null, interval = 2000) {
    const [data, setData] = useState<NexusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const etag = useRef<string | null>(null);

    const fetchNexus = useCallback(async () => {
        if (!eventKey) return;

        try {
            const response = await fetch(`/api/event/${eventKey}/nexus`, {
                headers: etag.current
                    ? { "If-None-Match": etag.current }
                    : {},
                cache: "no-store",
            });

            if (response.status === 304) {
                return;
            }

            if (!response.ok) {
                throw new Error(`Nexus request failed: ${response.status}`);
            }

            const next: NexusData = await response.json();

            etag.current = response.headers.get("etag");

            setData(next);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Unknown Nexus error")
            );
        } finally {
            setLoading(false);
        }
    }, [eventKey]);

    useEffect(() => {
        if (!eventKey) return;

        fetchNexus();

        const timer = setInterval(fetchNexus, interval);

        return () => clearInterval(timer);
    }, [eventKey, interval, fetchNexus]);

    return {
        data,
        loading,
        error,
        refresh: fetchNexus,
    };
}