import { tba } from "./tba";
import { buildStreams } from "@/lib/gameday/buildStreams";

/* -------------------------- */
/* 🧠 Helpers                 */
/* -------------------------- */

function parseDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function getWeekRange(now = new Date()) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function isEventThisWeek(
    event: any,
    weekStart: Date,
    weekEnd: Date
) {
    const start = parseDate(event.start_date);
    const end = parseDate(event.end_date);

    return start <= weekEnd && end >= weekStart;
}

function isMatchPlayed(match: any) {
    return match?.actual_time != null;
}

/* -------------------------- */
/* 🚀 Service                 */
/* -------------------------- */

export const TBA = {
    /* ------------------ */
    /* 👤 Teams            */
    /* ------------------ */

    getTeam: (teamKey: string) =>
        tba.get(`/team/${teamKey}`),

    getTeamDistricts: (teamKey: string) =>
        tba.get(`/team/${teamKey}/districts`),

    getTeamEvents: (teamKey: string, year: number) =>
        tba.get(`/team/${teamKey}/events/${year}`),

    getTeamEventStatus: (
        teamKey: string,
        eventKey: string
    ) =>
        tba.get(
            `/team/${teamKey}/event/${eventKey}/status`
        ),

    getTeamMatches: (
        teamKey: string,
        eventKey: string
    ) =>
        tba.get(
            `/team/${teamKey}/event/${eventKey}/matches`
        ),

    getTeamMatchesSimple: (
        teamKey: string,
        eventKey: string
    ) =>
        tba.get(
            `/team/${teamKey}/event/${eventKey}/matches/simple`
        ),

    /* ------------------ */
    /* 📅 Events           */
    /* ------------------ */

    getEvent: (eventKey: string) =>
        tba.get(`/event/${eventKey}`),

    getEventSimple: (eventKey: string) =>
        tba.get(`/event/${eventKey}/simple`),

    getEvents: (year: number) =>
        tba.get(`/events/${year}`),

    getEventsSimple: (year: number) =>
        tba.get(`/events/${year}/simple`),

    /* ------------------ */
    /* 🔍 Derived Events   */
    /* ------------------ */

    getActiveEvents: async (year: number) => {
        const events = (await TBA.getEvents(year)) as any[];

        const { start, end } = getWeekRange();

        return events.filter((event) =>
            isEventThisWeek(event, start, end)
        );
    },

    getActiveEventsWithTeams: async (year: number) => {
        const activeEvents =
            await TBA.getActiveEvents(year);

        return Promise.all(
            activeEvents.map(async (event: any) => {
                const teams =
                    await TBA.getTeamsAtEvent(event.key);

                return {
                    ...event,
                    teams,
                };
            })
        );
    },

    getActiveEventsWithMatches: async (year: number) => {
        const events =
            (await TBA.getEvents(year)) as any[];

        const now = new Date();

        const candidates = events.filter((event) => {
            const start = parseDate(event.start_date);
            const end = parseDate(event.end_date);

            return start <= now && now <= end;
        });

        const enriched = await Promise.all(
            candidates.map(async (event: any) => {
                const matches =
                    (await TBA.getEventMatchesSimple(
                        event.key
                    )) as any[];

                const hasPlayedMatches =
                    matches.some(isMatchPlayed);

                return hasPlayedMatches
                    ? event
                    : null;
            })
        );

        return enriched.filter(Boolean);
    },

    getActiveEventsFull: async (year: number) => {
        const events =
            await TBA.getActiveEventsWithMatches(year);

        return Promise.all(
            events
                .filter(Boolean)
                .map(async (event: any) => {
                    const [teams, matches] =
                        await Promise.all([
                            TBA.getTeamsAtEvent(event.key),
                            TBA.getEventMatchesSimple(
                                event.key
                            ),
                        ]);

                    const hasDivisions =
                        (event.division_keys?.length ?? 0) > 0;

                    const hasMatches =
                        matches.length > 0;

                    const hasPlayedMatches =
                        matches.some(isMatchPlayed);

                    const now = new Date();
                    const start =
                        parseDate(event.start_date);

                    const isPastStart =
                        now >= start;

                    return {
                        ...event,
                        teams,
                        matches,

                        flags: {
                            isPastStart,
                            hasDivisions,
                            hasMatches,
                            hasPlayedMatches,
                        },
                    };
                })
        );
    },

    /* ------------------ */
    /* TBA Nexus Integration */
    /* ------------------ */

    getEventNexusInfo: (eventKey: string) =>
        tba.get(
            `/event/${eventKey}/nexus_info`
        ),

    /* ------------------ */
    /* 🧍 Event Teams      */
    /* ------------------ */

    getTeamsAtEvent: (eventKey: string) =>
        tba.get(`/event/${eventKey}/teams`),

    getTeamsAtEventSimple: (eventKey: string) =>
        tba.get(`/event/${eventKey}/teams/simple`),

    getTeamKeysAtEvent: (eventKey: string) =>
        tba.get(`/event/${eventKey}/teams/keys`),

    getEventPlayoffAlliances: (eventKey: string) =>
        tba.get(`/event/${eventKey}/alliances`),

    getEventTeamsStatuses: (eventKey: string) =>
        tba.get(
            `/event/${eventKey}/teams/statuses`
        ),

    /* ------------------ */
    /* 🤖 Matches          */
    /* ------------------ */

    getMatch: (matchKey: string) =>
        tba.get(`/match/${matchKey}`),

    getEventMatches: (eventKey: string) =>
        tba.get(`/event/${eventKey}/matches`),

    getEventMatchesSimple: (eventKey: string) =>
        tba.get(
            `/event/${eventKey}/matches/simple`
        ),

    getNextMatch: async (eventKey: string) => {
        const matches = (await TBA.getEventMatches(eventKey)) as any[];

        const sorted = [...(matches ?? [])].sort((a, b) => {
            const ta = a?.predicted_time ?? Infinity;
            const tb = b?.predicted_time ?? Infinity;

            return ta - tb;
        });

        return (
            sorted.find(
                (match) => match?.actual_time == null
            ) ?? null
        );
    },

    getLastMatch: async (eventKey: string) => {
        const matches = (await TBA.getEventMatches(eventKey)) as any[];

        let lastMatch = null;
        let bestTime = -Infinity;

        for (const match of matches ?? []) {
            if (match?.actual_time == null) continue;

            if (match.actual_time > bestTime) {
                bestTime = match.actual_time;
                lastMatch = match;
            }
        }

        return lastMatch;
    },
    
    /* ------------------ */
    /* 🏆 Districts        */
    /* ------------------ */

    getDistricts: (year: number) =>
        tba.get(`/districts/${year}`),

    getDistrictTeams: (districtKey: string) =>
        tba.get(
            `/district/${districtKey}/teams`
        ),

    getDistrictTeamKeys: (districtKey: string) =>
        tba.get(
            `/district/${districtKey}/teams/keys`
        ),

    getDistrictEvents: (districtKey: string) =>
        tba.get(
            `/district/${districtKey}/events`
        ),

    getDistrictRankings: (districtKey: string) =>
        tba.get(
            `/district/${districtKey}/rankings`
        ),

    getDistrictAdvancement: (districtKey: string) =>
        tba.get(
            `/district/${districtKey}/advancement`
        ),

    getDistrictTeamsAdvancedToCMP: async (
        districtKey: string
    ) => {
        const advancement = await tba.get(
            `/district/${districtKey}/advancement`
        );

        return Object.entries(advancement)
            .filter(([, t]: any) => t.cmp === true)
            .map(([key, t]: any) => ({
                key,
                ...t,
                district_key: districtKey,
                district_abbreviation:
                    districtKey
                        .replace(/[0-9]/g, "")
                        .toUpperCase(),
            }));
    },

    getAllDistrictTeamsAdvancedToCMP: async (
        year: number
    ) => {
        const districts = await tba.get(
            `/districts/${year}`
        );

        const allCMPTeams =
            await Promise.all(
                districts.map((district: any) =>
                    tba
                        .get(
                            `/district/${district.key}/advancement`
                        )
                        .then((advancement: any) =>
                            Object.entries(advancement)
                                .filter(
                                    ([, t]: any) =>
                                        t.cmp === true
                                )
                                .map(([key, t]: any) => ({
                                    key,
                                    ...t,
                                    district_key:
                                        district.key,
                                    district_abbreviation:
                                        district.key
                                            .replace(
                                                /[0-9]/g,
                                                ""
                                            )
                                            .toUpperCase(),
                                }))
                        )
                )
            );

        return allCMPTeams.flat();
    },

    /* ------------------ */
    /* 📺 Webcasts         */
    /* ------------------ */

    getEventWebcasts: (eventKey: string) =>
        tba
            .get(`/event/${eventKey}`)
            .then((event: any) =>
                buildStreams(event.webcasts)
            ),
};