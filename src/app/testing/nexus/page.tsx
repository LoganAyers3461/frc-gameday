"use client";

import { useNexus } from "@/components/gameday/hooks/useNexus";

export default function NexusTest() {
    const {
        data: nexusData,
        loading,
        error,
    } = useNexus("demo3836");

    if (loading) {
        return <div>Loading Nexus data...</div>;
    }

    if (error) {
        return <div>Nexus error: {error.message}</div>;
    }

    if (!nexusData) {
        return <div>No Nexus data available.</div>;
    }

    return (
        <div>
            <h1>Nexus Test</h1>

            <p>
                <strong>Event:</strong> {nexusData.eventKey}
            </p>

            <p>
                <strong>Data as of:</strong>{" "}
                {new Date(nexusData.dataAsOfTime).toLocaleString()}
            </p>

            <p>
                <strong>Now queuing:</strong> {nexusData.nowQueuing}
            </p>

            <p>
                <strong>Announcements:</strong> {nexusData.announcements.entries().map(([key, value]) => (
                    <div key={key}>
                        <strong>{value.announcement}:</strong> {Date(value.postedTime).toLocaleString()}
                    </div>
                ))}
            </p>

            <h2>Matches</h2>

            {nexusData.matches.map((match) => (
                <div key={match.label}>
                    <strong>{match.label}</strong>{" "}
                    — {match.status}
                    <br />
                    Red: {match.redTeams.join(", ")}
                    <br />
                    Blue: {match.blueTeams.join(", ")}
                </div>
            ))}
        </div>
    );
}