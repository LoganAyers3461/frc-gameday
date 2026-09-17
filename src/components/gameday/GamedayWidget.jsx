"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowPathIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import StreamView from "./StreamView";
import ChatView from "./ChatView";
import StreamModal from "./StreamModal";
import EventStatsSideBar from "./EventStatsSideBar";
import TeamModal from "./teamElements/TeamModal";
import TeamTracker from "./teamElements/TeamTracker";
import MatchStrip from "./navbar/MatchStrip";
import { buildStreams } from "@/lib/gameday/buildStreams";
import { useEvent } from "./hooks/useEvent";
import { useTeams } from "./hooks/useTeams";
import { useTeamsStatuses } from "./hooks/useTeamsStatuses";
import { usePlayoffAlliances } from "./hooks/usePlayoffAlliances";
import { useMatches } from "./hooks/useMatches";
import { useTrackedMatches } from "./hooks/useTrackedMatches";
import { useStreamController } from "./hooks/useStreamController";

const EMPTY_TEAMS = [];

export default function GamedayWidget({
  event,
  initialTeams = EMPTY_TEAMS,
  registerLabel,
  isDivisional = false,
  multiview = {},
}) {
  const { event: eventData, loading, error } =
    useEvent(event);

  const { teams } = useTeams(event);

  const {
    teamsStatuses,
    reload: reloadStatuses,
  } = useTeamsStatuses(event);

  const {
    alliances,
    reload: reloadAlliances,
  } = usePlayoffAlliances(event);

  const {
    matches,
    eventNextMatch,
    eventLastMatch,
    reload: reloadMatches,
  } = useMatches(event);

  const [trackedTeams, setTrackedTeams] =
    useState(initialTeams);

  const [streamsRaw, setStreamsRaw] =
    useState([]);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [statsOpen, setStatsOpen] =
    useState(false);

  const [teamsOpen, setTeamsOpen] =
    useState(false);

  const [streamsOpen, setStreamsOpen] =
    useState(false);

  const [chatOpen, setChatOpen] =
    useState(false);

  /*
   * `initialTeams` is an actual prop for direct GamedayWidget
   * callers. Keep it synchronized when that prop genuinely
   * changes.
   *
   * The default value is module-scoped (`EMPTY_TEAMS`) so
   * callers that omit the prop do not receive a new [] on
   * every render.
   */
  useEffect(() => {
    setTrackedTeams(initialTeams);
  }, [initialTeams]);

  /*
   * The label belongs to this widget/event, not its current
   * Multiview layout slot.
   *
   * Depend only on the primitive label value. Multiview's
   * registerLabel wrapper may be recreated when Multiview
   * renders, but that should not cause this effect to fire.
   */
  const eventLabel =
    eventData?.short_name ||
    eventData?.name ||
    eventData?.key;

  useEffect(() => {
    if (eventLabel) {
      registerLabel?.(eventLabel);
    }
  }, [eventLabel]);

  useEffect(() => {
    let cancelled = false;

    if (!eventData?.webcasts) {
      setStreamsRaw([]);
      return;
    }

    buildStreams(eventData.webcasts).then(
      (streams) => {
        if (!cancelled) {
          setStreamsRaw(streams);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [eventData?.webcasts]);

  const {
    streams,
    activeKey,
    activeStream,
    setActiveKey,
  } = useStreamController(
    streamsRaw,
    eventData?.timezone
  );

  const {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
    trackedNextMatches,
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

  const teamCount = useMemo(
    () =>
      Math.max(
        teams.length,
        Object.keys(teamsStatuses).length
      ),
    [teams, teamsStatuses]
  );

  const trackerPosition =
    multiview.teamTracker ?? "sides";

  const refreshLiveData = useCallback(() => {
    void reloadMatches();
    void reloadAlliances();
    void reloadStatuses();
  }, [
    reloadMatches,
    reloadAlliances,
    reloadStatuses,
  ]);

  useEffect(() => {
    const handler = (event) => {
      if (
        event.key.toLowerCase() !== "r"
      ) {
        return;
      }

      const element =
        document.activeElement;

      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          element?.tagName || ""
        )
      ) {
        return;
      }

      refreshLiveData();
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [refreshLiveData]);

  const toggleTeam = useCallback(
    (team) =>
      setTrackedTeams((current) =>
        current.includes(team)
          ? current.filter(
              (value) => value !== team
            )
          : [...current, team]
      ),
    []
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-sm text-neutral-500">
        Loading event…
      </div>
    );
  }

  if (error || !eventData) {
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
      {trackedTeams.length > 0 && (
        <TeamTracker
          teams={trackedTeams}
          teamsStatuses={teamsStatuses}
          teamCount={teamCount}
          nextMatches={trackedNextMatches}
          position={trackerPosition}
        />
      )}

      <div className="absolute left-2 top-2 z-50">
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          onClick={() =>
            setSettingsOpen(
              (value) => !value
            )
          }
          className={`icon-button rounded-md border border-white/10 bg-neutral-950/85 shadow-lg backdrop-blur ${
            settingsOpen ? "active" : ""
          }`}
        >
          <Cog6ToothIcon />
        </button>

        {settingsOpen && (
          <div className="absolute left-0 top-full mt-1 flex flex-col gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
            <button
              className={`icon-button ${
                statsOpen ? "active" : ""
              }`}
              title="Event rankings"
              onClick={() =>
                setStatsOpen(
                  (value) => !value
                )
              }
            >
              <ChartBarIcon />
            </button>

            <button
              className={`icon-button ${
                trackedTeams.length
                  ? "active"
                  : ""
              }`}
              title="Track teams"
              onClick={() =>
                setTeamsOpen(true)
              }
            >
              <UserGroupIcon />
            </button>

            <button
              className="icon-button"
              title="Choose webcast"
              onClick={() =>
                setStreamsOpen(true)
              }
            >
              <VideoCameraIcon />
            </button>

            <button
              className={`icon-button ${
                chatOpen ? "active" : ""
              }`}
              title="Open chat"
              onClick={() =>
                setChatOpen(
                  (value) => !value
                )
              }
            >
              <ChatBubbleLeftRightIcon />
            </button>

            <button
              className="icon-button"
              title="Refresh live data"
              onClick={refreshLiveData}
            >
              <ArrowPathIcon />
            </button>
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <StreamView
          stream={activeStream}
        />

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

      <footer className="relative z-20 shrink-0">
        <MatchStrip
          matches={displayMatches}
          team={trackedTeams}
          nextMatch={nextMatch}
          lastMatch={lastMatch}
          eventTimezone={
            eventData.timezone
          }
          playoffAlliances={alliances}
          eventName={
            eventData.short_name ||
            eventData.name
          }
          isDivisional={isDivisional}
          multiview={multiview}
        />
      </footer>

      {statsOpen && (
        <aside className="absolute inset-y-0 right-0 z-30 w-[min(360px,92vw)] border-l border-white/10 bg-neutral-950 shadow-2xl">
          <EventStatsSideBar
            teamStatuses={teamsStatuses}
            playoffAlliances={alliances}
          />
        </aside>
      )}

      {chatOpen && (
        <aside className="absolute inset-y-0 right-0 z-30 w-[min(420px,92vw)] border-l border-white/10 bg-black shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold">
              Live chat

              <button
                onClick={() =>
                  setChatOpen(false)
                }
                className="text-neutral-500"
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
        </aside>
      )}

      <StreamModal
        open={streamsOpen}
        onClose={() =>
          setStreamsOpen(false)
        }
        streams={streams}
        activeKey={activeKey}
        onSelect={setActiveKey}
      />

      <TeamModal
        open={teamsOpen}
        onClose={() =>
          setTeamsOpen(false)
        }
        teams={teams}
        teamsStatuses={teamsStatuses}
        trackedTeams={trackedTeams}
        onToggle={toggleTeam}
      />
    </section>
  );
}