"use client";
export default function Rank({ status }) {
  if (!status) return null;
  if (status.qual?.ranking?.rank != null) return <span>Rank {status.qual.ranking.rank}/{status.qual.num_teams ?? "?"}</span>;
  if (status.alliance?.name) return <span>{status.alliance.name}</span>;
  return null;
}
