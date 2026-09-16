"use client";
export default function Record({ status }) {
  const record = status?.playoff?.record || status?.playoff?.current_level_record || status?.qual?.ranking?.record;
  if (!record) return null;
  return <span>{record.wins ?? 0}W-{record.losses ?? 0}L{record.ties ? `-${record.ties}T` : ""}</span>;
}
