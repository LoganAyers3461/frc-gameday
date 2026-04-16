import { tba } from "./tba";

export const TBA = {
  // 👤 Teams
  getTeam: (teamKey: string) =>
    tba.get(`/team/${teamKey}`),

  getTeamEvents: (teamKey: string, year: number) =>
    tba.get(`/team/${teamKey}/events/${year}`),

  // 📅 Events
  getEvent: (eventKey: string) =>
    tba.get(`/event/${eventKey}`),

  getTeamAtEvent: (eventKey: string) =>
    tba.get(`/event/${eventKey}/teams`),

  // 🤖 Matches
  getEventMatches: (eventKey: string) =>
    tba.get(`/event/${eventKey}/matches`),

  // 📺 Webcasts
  getEventWebcasts: (eventKey: string) =>
    tba.get(`/event/${eventKey}/webcasts`),
};