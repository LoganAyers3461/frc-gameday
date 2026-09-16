"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowPathIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import StreamView from "./StreamView";
import ChatView from "./ChatView";
import StreamModal from "./StreamModal";
import MatchStrip from "./navbar/MatchStrip";
import EventStatsSideBar from "./EventStatsSideBar";
import TeamModal from "./teamElements/TeamModal";

import { buildStreams } from "@/lib/gameday/buildStreams";

import { useStreamController } from "./hooks/useStreamController";
import { useMatches } from "./hooks/useMatches";
import { useTrackedMatches } from "./hooks/useTrackedMatches";
import { useEvent } from "./hooks/useEvent";
import { useTeams } from "./hooks/useTeams";
import { usePlayoffAlliances } from "./hooks/usePlayoffAlliances";
import { useTeamsStatuses } from "./hooks/useTeamsStatuses";

function teamNumber(key) {
  return String(key || "").replace(
    /^frc/i,
    ""
  );
}

function teamStatusSummary(
  status,
  teamCount
) {
  const ranking = status?.qual?.ranking;

  if (!ranking) {
    return {
      record: "—",
      rank: "—",
    };
  }

  const record = ranking.record;

  const wins = record?.wins ?? 0;
  const losses = record?.losses ?? 0;
  const ties = record?.ties ?? 0;

  return {
    record: `${wins}-${losses}-${ties}`,
    rank:
      ranking.rank != null
        ? `#${ranking.rank}/${
            teamCount || "?"
          }`
        : "—",
  };
}

function compactNextMatch(match) {
  if (!match) return null;

  const level = String(
    match.comp_level || ""
  ).toLowerCase();

  const number =
    match.match_number ?? "";

  const set = match.set_number;

  switch (level) {
    case "qm":
      return `Q${number}`;

    case "ef":
      return set != null
        ? `EF${set}-${number}`
        : `EF${number}`;

    case "qf":
      return set != null
        ? `QF${set}-${number}`
        : `QF${number}`;

    case "sf":
      return set != null
        ? `SF${set}-${number}`
        : `SF${number}`;

    case "f":
      return `F${number}`;

    default:
      return level
        ? `${level.toUpperCase()}${number}`
        : null;
  }
}

function minutesUntil(timestamp) {
  if (!timestamp) return null;

  const seconds = Math.round(
    (timestamp * 1000 - Date.now()) /
      1000
  );

  if (
    seconds < 0 ||
    seconds > 60 * 60
  ) {
    return null;
  }

  if (seconds < 60) {
    return `${Math.max(
      0,
      seconds
    )}s`;
  }

  return `${Math.ceil(
    seconds / 60
  )}m`;
}

function TeamPill({
  team,
  status,
  teamCount,
  nextMatch,
}) {
  const [now, setNow] = useState(
    () => Date.now()
  );

  useEffect(() => {
    if (!nextMatch?.predicted_time) {
      return;
    }

    const id =
      window.setInterval(
        () => setNow(Date.now()),
        1000
      );

    return () =>
      window.clearInterval(id);
  }, [
    nextMatch?.predicted_time,
  ]);

  const summary =
    teamStatusSummary(
      status,
      teamCount
    );

  const countdown =
    nextMatch?.predicted_time
      ? minutesUntil(
          nextMatch.predicted_time
        )
      : null;

  void now;

  return (
    <div className="pointer-events-auto flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-neutral-950/90 px-2 shadow-lg backdrop-blur">
      <span className="font-mono text-[11px] font-bold text-white">
        {teamNumber(team)}
      </span>

      <span className="font-mono text-[9px] text-neutral-400">
        {summary.record}
      </span>

      <span className="font-mono text-[9px] text-neutral-500">
        {summary.rank}
      </span>

      {nextMatch && (
        <>
          <span className="h-3 w-px bg-white/10" />

          <span className="font-mono text-[10px] font-bold text-white">
            {compactNextMatch(
              nextMatch
            )}
          </span>

          {countdown && (
            <span
              className={[
                "font-mono text-[9px] tabular-nums",
                countdown === "0s"
                  ? "font-bold text-white"
                  : "text-neutral-400",
              ].join(" ")}
            >
              {countdown}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function TeamTracker({
  teams,
  teamsStatuses,
  teamCount,
  nextMatches,
  position,
}) {
  if (!teams.length) {
    return null;
  }

  if (position === "bottom") {
    return (
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-40 flex justify-center">
        <div className="pointer-events-auto flex max-w-[calc(100%-1rem)] min-w-0 gap-1 overflow-x-auto overflow-y-hidden px-1 no-scrollbar">
          {teams.map((team) => (
            <TeamPill
              key={team}
              team={team}
              status={
                teamsStatuses?.[team]
              }
              teamCount={teamCount}
              nextMatch={
                nextMatches[team]
              }
            />
          ))}
        </div>
      </div>
    );
  }
  if (position === "top") {
    return (
      <div className="pointer-events-none absolute top-2 left-0 right-0 z-40 flex justify-center">
        <div className="pointer-events-auto flex max-w-[calc(100%-1rem)] min-w-0 gap-1 overflow-x-auto overflow-y-hidden px-1 no-scrollbar">
          {teams.map((team) => (
            <TeamPill
              key={team}
              team={team}
              status={
                teamsStatuses?.[team]
              }
              teamCount={teamCount}
              nextMatch={
                nextMatches[team]
              }
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-40">
      <div className="absolute left-2 top-1/2 flex max-w-[calc(50%-1rem)] -translate-y-1/2 flex-col gap-1">
        {teams
          .filter(
            (_, index) =>
              index % 2 === 0
          )
          .map((team) => (
            <TeamPill
              key={team}
              team={team}
              status={
                teamsStatuses?.[team]
              }
              teamCount={teamCount}
              nextMatch={
                nextMatches[team]
              }
            />
          ))}
      </div>

      <div className="absolute right-2 top-1/2 flex max-w-[calc(50%-1rem)] -translate-y-1/2 flex-col items-end gap-1">
        {teams
          .filter(
            (_, index) =>
              index % 2 === 1
          )
          .map((team) => (
            <TeamPill
              key={team}
              team={team}
              status={
                teamsStatuses?.[team]
              }
              teamCount={teamCount}
              nextMatch={
                nextMatches[team]
              }
            />
          ))}
      </div>
    </div>
  );
}

export default function GamedayWidget({
  event,
  initialTeams = [],
  registerLabel,
  isDivisional = false,
  multiview = {},
}) {
  const {
    event: eventData,
    loading: eventLoading,
    error: eventError,
  } = useEvent(event);

  const { teams } =
    useTeams(event);

  const {
    teamsStatuses,
    reload: reloadStatuses,
  } = useTeamsStatuses(event);

  const {
    alliances: playoffAlliances,
    reload: reloadAlliances,
  } = usePlayoffAlliances(
    event
  );

  const {
    matches,
    eventNextMatch,
    eventLastMatch,
    reload: reloadMatches,
  } = useMatches(event);

  const [trackedTeams, setTrackedTeams] =
    useState(initialTeams);

  const [rawStreams, setRawStreams] =
    useState([]);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [streamModalOpen, setStreamModalOpen] =
    useState(false);

  const [teamModalOpen, setTeamModalOpen] =
    useState(false);

  const [statsOpen, setStatsOpen] =
    useState(false);

  const [chatOpen, setChatOpen] =
    useState(false);

  const {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
  } = useTrackedMatches(
    matches,
    trackedTeams
  );

  const teamMode =
    trackedTeams.length > 0;

  const nextMatch = teamMode
    ? trackedNextMatch
    : eventNextMatch;

  const lastMatch = teamMode
    ? trackedLastMatch
    : eventLastMatch;

  const displayMatches = teamMode
    ? trackedMatches
    : matches;

  const teamTrackerPosition =
    multiview?.teamTracker ??
    "sides";

  useEffect(() => {
    if (!eventData) return;

    registerLabel?.(
      eventData.short_name ||
        eventData.name ||
        eventData.key
    );
  }, [
    eventData,
    registerLabel,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!eventData?.webcasts) {
      setRawStreams([]);
      return;
    }

    buildStreams(
      eventData.webcasts
    ).then((streams) => {
      if (!cancelled) {
        setRawStreams(streams);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    eventData?.webcasts,
  ]);

  const {
    streams,
    activeStream,
    activeKey,
    setActiveKey,
  } = useStreamController(
    rawStreams,
    eventData?.timezone
  );

  function addTrackedTeam(
    teamKey
  ) {
    setTrackedTeams(
      (previous) =>
        previous.includes(teamKey)
          ? previous
          : [
              ...previous,
              teamKey,
            ]
    );
  }

  function removeTrackedTeam(
    teamKey
  ) {
    setTrackedTeams(
      (previous) =>
        previous.filter(
          (key) =>
            key !== teamKey
        )
    );
  }

  function reloadDataSources() {
    reloadMatches();
    reloadAlliances();
    reloadStatuses();
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.key.toLowerCase() ===
          "r" &&
        ![
          "INPUT",
          "TEXTAREA",
        ].includes(
          document.activeElement
            ?.tagName || ""
        )
      ) {
        reloadDataSources();
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
  }, [
    reloadMatches,
    reloadAlliances,
    reloadStatuses,
  ]);

  const teamCount = useMemo(
    () =>
      Object.keys(
        teamsStatuses || {}
      ).length ||
      teams?.length ||
      0,
    [
      teamsStatuses,
      teams,
    ]
  );

  const trackedTeamNextMatches =
    useMemo(() => {
      const result = {};

      for (const team of trackedTeams) {
        const candidate =
          matches
            ?.filter((match) => {
              if (
                !match?.key ||
                !match?.predicted_time
              ) {
                return false;
              }

              const teamsInMatch = [
                ...(match
                  .alliances
                  ?.red
                  ?.team_keys ||
                  []),
                ...(match
                  .alliances
                  ?.blue
                  ?.team_keys ||
                  []),
              ];

              return (
                teamsInMatch.includes(
                  team
                ) &&
                match.predicted_time *
                    1000 >=
                  Date.now() -
                    60_000
              );
            })
            .sort(
              (a, b) =>
                (a.predicted_time ||
                  Infinity) -
                (b.predicted_time ||
                  Infinity)
            )[0];

        result[team] =
          candidate || null;
      }

      return result;
    }, [
      matches,
      trackedTeams,
    ]);

  if (eventLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-sm text-neutral-500">
        Loading event…
      </div>
    );
  }

  if (
    eventError ||
    !eventData
  ) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-center text-sm text-neutral-500">
        <div>
          <div className="font-semibold text-white">
            Event unavailable
          </div>

          <div className="mt-1">
            {event}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black">
      {/* =========================
          TRACKED TEAM STATUS
      ========================== */}

      {trackedTeams.length >
        0 && (
        <TeamTracker
          teams={trackedTeams}
          teamsStatuses={
            teamsStatuses
          }
          teamCount={teamCount}
          nextMatches={
            trackedTeamNextMatches
          }
          position={
            teamTrackerPosition
          }
        />
      )}

      {/* =========================
          SETTINGS
      ========================== */}

      <div className="absolute left-2 top-2 z-50">
        <button
          title="Settings"
          aria-label="Settings"
          onClick={() =>
            setSettingsOpen(
              (value) => !value
            )
          }
          className={[
            "icon-button",
            "rounded-md border border-white/10 bg-neutral-950/85 shadow-lg backdrop-blur",
            settingsOpen
              ? "active"
              : "",
          ].join(" ")}
        >
          <Cog6ToothIcon />
        </button>

        {settingsOpen && (
          <div className="absolute left-0 top-full mt-1 flex flex-col gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
            <button
              title="Event rankings"
              onClick={() =>
                setStatsOpen(
                  (value) =>
                    !value
                )
              }
              className={`icon-button ${
                statsOpen
                  ? "active"
                  : ""
              }`}
            >
              <ChartBarIcon />
            </button>

            <button
              title="Track teams"
              onClick={() =>
                setTeamModalOpen(
                  true
                )
              }
              className={`icon-button ${
                teamMode
                  ? "active"
                  : ""
              }`}
            >
              <UserGroupIcon />
            </button>

            <button
              title="Choose webcast"
              onClick={() =>
                setStreamModalOpen(
                  true
                )
              }
              className="icon-button"
            >
              <VideoCameraIcon />
            </button>

            <button
              title="Open chat"
              onClick={() =>
                setChatOpen(
                  (value) =>
                    !value
                )
              }
              className={`icon-button ${
                chatOpen
                  ? "active"
                  : ""
              }`}
            >
              <ChatBubbleLeftRightIcon />
            </button>

            <button
              title="Refresh event data"
              onClick={
                reloadDataSources
              }
              className="icon-button"
            >
              <ArrowPathIcon />
            </button>
          </div>
        )}
      </div>

      {/* =========================
          STREAM
      ========================== */}

      <div className="relative min-h-0 flex-1">
        <StreamView
          stream={activeStream}
        />

        {!activeStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-white/10 bg-neutral-950/90 px-5 py-4 text-center">
              <div className="font-semibold">
                No webcast available
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                This event has not published
                a supported live stream.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          MATCH INFORMATION
      ========================== */}

      <footer className="relative z-20 shrink-0">
        <MatchStrip
          matches={displayMatches}
          team={trackedTeams}
          nextMatch={nextMatch}
          lastMatch={lastMatch}
          eventTimezone={
            eventData.timezone
          }
          playoffAlliances={
            playoffAlliances
          }
          playoffType={
            eventData.playoff_type
          }
          eventName={
            eventData.short_name ||
            eventData.name
          }
          isDivisional={
            isDivisional
          }
          multiview={multiview}
        />
      </footer>

      {/* =========================
          STATS
      ========================== */}

      {statsOpen && (
        <div className="absolute inset-y-0 right-0 z-30 w-[min(360px,92vw)] border-l border-white/10 bg-neutral-950 shadow-2xl">
          <EventStatsSideBar
            teamStatuses={
              teamsStatuses
            }
            playoffAlliances={
              playoffAlliances
            }
          />
        </div>
      )}

      {/* =========================
          CHAT
      ========================== */}

      {chatOpen && (
        <div className="absolute inset-y-0 right-0 z-30 w-[min(420px,92vw)] border-l border-white/10 bg-black shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold">
              <span>
                Live chat
              </span>

              <button
                onClick={() =>
                  setChatOpen(false)
                }
                className="text-neutral-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <ChatView
                stream={activeStream}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODALS
      ========================== */}

      <StreamModal
        open={streamModalOpen}
        setOpen={
          setStreamModalOpen
        }
        streams={streams}
        activeKey={activeKey}
        setActiveKey={
          setActiveKey
        }
      />

      <TeamModal
        open={teamModalOpen}
        setOpen={
          setTeamModalOpen
        }
        teams={teams}
        teamsStatuses={
          teamsStatuses
        }
        activeTeam={
          trackedTeams
        }
        addTrackedTeam={
          addTrackedTeam
        }
        removeTrackedTeam={
          removeTrackedTeam
        }
      />
    </section>
  );
}