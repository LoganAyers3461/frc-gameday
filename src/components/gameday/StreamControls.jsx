"use client";

export default function StreamControls({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded"
    >
      Streams
    </button>
  );
}