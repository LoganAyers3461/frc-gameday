"use client";

export default function Record({ status }) {
  console.log("Record render with status", status);
  if (!status) return <span>-W -L -T</span>;

  const playoffRecord = status?.playoff?.record;
  const qualRecord = status?.qual?.ranking?.record;

  const record = playoffRecord || qualRecord;

  if (!record) return <span>-W -L -T</span>;

  return (
    <span className="flex gap-1 items-center">
      <span className="text-green-400 font-bold">{record.wins}W</span>
      <span className="text-red-400 font-bold">{record.losses}L</span>
      {record.ties > 0 && (
        <span className="text-gray-300 font-bold">{record.ties}T</span>
      )}
    </span>
  );
}