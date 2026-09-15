export type NexusMatch = {
    label: string;
    status: string;
    redTeams: string[];
    blueTeams: string[];
    times?: {
        estimatedQueueTime?: number;
        estimatedOnDeckTime?: number;
        estimatedOnFieldTime?: number;
        estimatedStartTime?: number;
        actualQueueTime?: number;
        actualOnDeckTime?: number;
        actualOnFieldTime?: number;
        actualStartTime?: number;
        actualCommitTime?: number;
    };
    breakAfter?: string;
    replayOf?: string;
};

export type NexusData = {
    eventKey: string;
    dataAsOfTime: number;
    nowQueuing: string;
    matches: NexusMatch[];
    announcements: unknown[];
    partsRequests: unknown[];
};