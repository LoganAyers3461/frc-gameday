export interface NexusMatchInfo {
    label: string;
    status:
        | "Queuing soon"
        | "Now queuing"
        | "On deck"
        | "On field";
    played: boolean;
    times: {
        estimated_queue_time_ms: number | null;
        estimated_start_time_ms: number | null;
    };
}

export interface NexusInfo {
    data_as_of_ms: number;
    now_queueing: {
        match_key: string;
        match_name: string;
    } | null;
    matches: Record<string, NexusMatchInfo>;
}