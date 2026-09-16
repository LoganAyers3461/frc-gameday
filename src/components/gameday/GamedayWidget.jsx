"use client";

import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  VideoCameraIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

import GamedayEventTeamInfo from "./GamedayEventTeamInfo";
import StreamView from "./StreamView";
import ChatView from "./ChatView";
import StreamModal from "./StreamModal";
import MatchStrip from "./navbar/MatchStrip";
import EventLocalTime from "./navbar/EventLocalTime";
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
import { useNexus } from "./hooks/useNexus";

export default function GamedayWidget({
  event,
  initialTeams = [],
  registerLabel,
  isDivisional = false,
}) {
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

  const { data: nexusData } = useNexus(event);

  const [trackedTeams, setTrackedTeams] = useState(initialTeams);
  const [rawStreams, setRawStreams] = useState([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const {
    trackedMatches,
    trackedNextMatch,
    trackedLastMatch,
  } = useTrackedMatches(matches, trackedTeams);

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

  useEffect(() => {
    if (!eventData) return;

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

    buildStreams(eventData.webcasts).then((streams) => {
      if (!cancelled) {
        setRawStreams(streams);
      }
    });

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

  function addTrackedTeam(teamKey) {
    setTrackedTeams((prev) =>
      prev.includes(teamKey)
        ? prev
        : [...prev, teamKey]
    );
  }

  function removeTrackedTeam(teamKey) {
    setTrackedTeams((prev) =>
      prev.filter((key) => key !== teamKey)
    );
  }

  function reloadDataSources() {
    reloadMatches();
    reloadAlliances();
    reloadStatuses();
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        e.key.toLowerCase() === "r" &&
        !["INPUT", "TEXTAREA"].includes(
          document.activeElement?.tagName
        )
      ) {
        reloadDataSources();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    reloadMatches,
    reloadAlliances,
    reloadStatuses,
  ]);

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

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black">

      {/* TOP BAR */}
      <header className="z-20 flex min-h-12 shrink-0 items-center gap-3 border-b border-white/10 bg-neutral-950/95 px-3 backdrop-blur">

        {/* Event */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {eventData.short_name || eventData.name}
          </div>

          { !isDivisional ? (
            <div className="truncate text-[11px] text-neutral-500">
              {[
                eventData.city,
                eventData.state_prov,
                eventData.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          ) : ( <div> </div> ) }
        </div>

          {/* Tracking scope */}
          <div className="min-w-0 shrink-0">
            <GamedayEventTeamInfo
              team={trackedTeams}
            />
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              title="Settings"
              onClick={() => setSettingsOpen((value) => !value)}
              className={`icon-button ${settingsOpen ? "active" : ""}`}
            >
              <Cog6ToothIcon />
            </button>

              {settingsOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 flex flex-col gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
                <button
                  title="Event rankings"
                  onClick={() => setStatsOpen((value) => !value)}
                  className={`icon-button ${statsOpen ? "active" : ""}`}
                >
                  <ChartBarIcon />
                </button>

                <button
                  title="Track teams"
                  onClick={() => setTeamModalOpen(true)}
                  className={`icon-button ${teamMode ? "active" : ""}`}
                >
                  <UserGroupIcon />
                </button>

                <button
                  title="Choose webcast"
                  onClick={() => setStreamModalOpen(true)}
                  className="icon-button"
                >
                  <VideoCameraIcon />
                </button>

                <button
                  title="Open chat"
                  onClick={() => setChatOpen((value) => !value)}
                  className={`icon-button ${chatOpen ? "active" : ""}`}
                >
                  <ChatBubbleLeftRightIcon />
                </button>

                <button
                  title="Refresh event data"
                  onClick={reloadDataSources}
                  className="icon-button"
                >
                  <ArrowPathIcon />
                </button>
              </div>
            )}
          </div>

        {/* Event-local clock */}
        { !isDivisional ? (
            <div className="hidden rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-neutral-500 sm:block">
              <EventLocalTime
                timezone={eventData.timezone}
              />
            </div>
          ) : ( <div> </div> )
        }

        {/* Next match indicator */}
        {nexusData ? (
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:flex">
            <div className="text-[9px] uppercase tracking-widest text-neutral-500">
              Nexus
            </div>

            <div className="text-xs font-semibold">
              Now queuing: {nexusData.nowQueuing}
            </div>
          </div>
        ) : (
          <div className="hidden rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-neutral-500 sm:block">
            No Nexus Data
          </div>
        )}
      </header>

      {/* STREAM */}
      <div className="relative min-h-0 flex-1">
        <StreamView stream={activeStream} />

        {!activeStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-white/10 bg-neutral-950/90 px-5 py-4 text-center">
              <div className="font-semibold">
                No webcast available
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                This event has not published a supported live stream.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <footer className="z-20 shrink-0 border-t border-white/10 bg-neutral-950">
        <div className="flex min-h-[68px] items-center gap-2 px-2 py-1.5">

          {/* Match strip */}
          <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
            <MatchStrip
              matches={displayMatches}
              team={trackedTeams}
              nextMatch={nextMatch}
              lastMatch={lastMatch}
              eventTimezone={eventData.timezone}
              playoffAlliances={playoffAlliances}
              playoffType={eventData.playoff_type}
            />
          </div>
        </div>
      </footer>

      {/* STATS */}
      {statsOpen && (
        <div className="absolute inset-y-12 right-0 z-30 w-[min(360px,92vw)] border-l border-white/10 bg-neutral-950 shadow-2xl">
          <EventStatsSideBar
            teamStatuses={teamsStatuses}
            playoffAlliances={playoffAlliances}
          />
        </div>
      )}

      {/* CHAT */}
      {chatOpen && (
        <div className="absolute inset-y-12 right-0 z-30 w-[min(420px,92vw)] border-l border-white/10 bg-black shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold">
              <span>Live chat</span>

              <button
                onClick={() => setChatOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <ChatView stream={activeStream} />
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
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