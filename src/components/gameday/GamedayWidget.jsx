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
import TeamTracker from "./teamElements/TeamTracker";

import { buildStreams } from "@/lib/gameday/buildStreams";

import { useStreamController } from "./hooks/useStreamController";
import { useMatches } from "./hooks/useMatches";
import { useTrackedMatches } from "./hooks/useTrackedMatches";
import { useEvent } from "./hooks/useEvent";
import { useTeams } from "./hooks/useTeams";
import { usePlayoffAlliances } from "./hooks/usePlayoffAlliances";
import { useTeamsStatuses } from "./hooks/useTeamsStatuses";

export default function GamedayWidget({
  event,
  initialTeams = [],
  registerLabel,
  isDivisional = false,
  multiview = {},
}) {
  /*
   * =========================
   * EVENT DATA
   * =========================
   */

  const {
    event: eventData,
    loading: eventLoading,
    error: eventError,
  } = useEvent(event);

  const { teams } = useTeams(event);

  const {
    teamsStatuses,
    reload: reloadStatuses,
  } = useTeamsStatuses(event);

  const {
    alliances: playoffAlliances,
    reload: reloadAlliances,
  } = usePlayoffAlliances(event);

  const {
    matches,
    eventNextMatch,
    eventLastMatch,
    reload: reloadMatches,
  } = useMatches(event);

  /*
   * =========================
   * TRACKED TEAMS
   * =========================
   */

  const [trackedTeams, setTrackedTeams] =
    useState(initialTeams);

  const {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
    trackedNextMatches,
  } = useTrackedMatches(
    matches,
    trackedTeams
  );

  const teamMode = trackedTeams.length > 0;

  const nextMatch = teamMode
    ? trackedNextMatch
    : eventNextMatch;

  const lastMatch = teamMode
    ? trackedLastMatch
    : eventLastMatch;

  const displayMatches = teamMode
    ? trackedMatches
    : matches;

  /*
   * =========================
   * STREAMS
   * =========================
   */

  const [rawStreams, setRawStreams] = useState([]);

  useEffect(() => {
    if (!eventData) {
      return;
    }

    registerLabel?.(
      eventData.short_name ||
        eventData.name ||
        eventData.key
    );
  }, [eventData, registerLabel]);

  useEffect(() => {
    let cancelled = false;

    if (!eventData?.webcasts) {
      setRawStreams([]);
      return;
    }

    buildStreams(eventData.webcasts).then(
      (streams) => {
        if (!cancelled) {
          setRawStreams(streams);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [eventData?.webcasts]);

  const {
    streams,
    activeStream,
    activeKey,
    setActiveKey,
  } = useStreamController(
    rawStreams,
    eventData?.timezone
  );

  /*
   * =========================
   * UI STATE
   * =========================
   */

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

  /*
   * =========================
   * TEAM DISPLAY DATA
   * =========================
   */

  const teamCount = useMemo(() => {
    return (
      Object.keys(teamsStatuses || {}).length ||
      teams?.length ||
      0
    );
  }, [teamsStatuses, teams]);

  const teamTrackerPosition =
    multiview?.teamTracker ?? "sides";

  /*
   * =========================
   * TEAM ACTIONS
   * =========================
   */

  function addTrackedTeam(teamKey) {
    setTrackedTeams((previous) =>
      previous.includes(teamKey)
        ? previous
        : [...previous, teamKey]
    );
  }

  function removeTrackedTeam(teamKey) {
    setTrackedTeams((previous) =>
      previous.filter(
        (key) => key !== teamKey
      )
    );
  }

  /*
   * =========================
   * DATA REFRESH
   * =========================
   */

  function reloadDataSources() {
    reloadMatches();
    reloadAlliances();
    reloadStatuses();
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.key.toLowerCase() !== "r"
      ) {
        return;
      }

      const activeElement =
        document.activeElement;

      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          activeElement?.tagName || ""
        )
      ) {
        return;
      }

      reloadDataSources();
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

  /*
   * =========================
   * LOADING / ERROR STATES
   * =========================
   */

  if (eventLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-sm text-neutral-500">
        Loading event…
      </div>
    );
  }

  if (eventError || !eventData) {
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

  /*
   * =========================
   * MAIN EVENT VIEW
   * =========================
   */

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black">
      {/* =========================
          TEAM TRACKER
      ========================== */}

      {trackedTeams.length > 0 && (
        <TeamTracker
          teams={trackedTeams}
          teamsStatuses={teamsStatuses}
          teamCount={teamCount}
          nextMatches={trackedNextMatches}
          position={teamTrackerPosition}
        />
      )}

      {/* =========================
          SETTINGS
      ========================== */}

      <div className="absolute left-2 top-2 z-50">
        <button
          type="button"
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
            settingsOpen ? "active" : "",
          ].join(" ")}
        >
          <Cog6ToothIcon />
        </button>

        {settingsOpen && (
          <div className="absolute left-0 top-full mt-1 flex flex-col gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
            <button
              type="button"
              title="Event rankings"
              aria-label="Event rankings"
              onClick={() =>
                setStatsOpen(
                  (value) => !value
                )
              }
              className={[
                "icon-button",
                statsOpen ? "active" : "",
              ].join(" ")}
            >
              <ChartBarIcon />
            </button>

            <button
              type="button"
              title="Track teams"
              aria-label="Track teams"
              onClick={() =>
                setTeamModalOpen(true)
              }
              className={[
                "icon-button",
                teamMode ? "active" : "",
              ].join(" ")}
            >
              <UserGroupIcon />
            </button>

            <button
              type="button"
              title="Choose webcast"
              aria-label="Choose webcast"
              onClick={() =>
                setStreamModalOpen(true)
              }
              className="icon-button"
            >
              <VideoCameraIcon />
            </button>

            <button
              type="button"
              title="Open chat"
              aria-label="Open chat"
              onClick={() =>
                setChatOpen(
                  (value) => !value
                )
              }
              className={[
                "icon-button",
                chatOpen ? "active" : "",
              ].join(" ")}
            >
              <ChatBubbleLeftRightIcon />
            </button>

            <button
              type="button"
              title="Refresh event data"
              aria-label="Refresh event data"
              onClick={reloadDataSources}
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
        <StreamView stream={activeStream} />

        {!activeStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-white/10 bg-neutral-950/90 px-5 py-4 text-center">
              <div className="font-semibold text-white">
                No webcast available
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                This event has not published a
                supported live stream.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          MATCH STRIP
      ========================== */}

      <footer className="relative z-20 shrink-0">
        <MatchStrip
          matches={displayMatches}
          team={trackedTeams}
          nextMatch={nextMatch}
          lastMatch={lastMatch}
          eventTimezone={eventData.timezone}
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
          isDivisional={isDivisional}
          multiview={multiview}
        />
      </footer>

      {/* =========================
          EVENT STATS
      ========================== */}

      {statsOpen && (
        <div className="absolute inset-y-0 right-0 z-30 w-[min(360px,92vw)] border-l border-white/10 bg-neutral-950 shadow-2xl">
          <EventStatsSideBar
            teamStatuses={teamsStatuses}
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
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold text-white">
              <span>Live chat</span>

              <button
                type="button"
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
        setOpen={setStreamModalOpen}
        streams={streams}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
      />

      <TeamModal
        open={teamModalOpen}
        setOpen={setTeamModalOpen}
        teams={teams}
        teamsStatuses={teamsStatuses}
        activeTeam={trackedTeams}
        addTrackedTeam={addTrackedTeam}
        removeTrackedTeam={removeTrackedTeam}
      />
    </section>
  );
}