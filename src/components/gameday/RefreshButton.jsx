"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function RefreshButton({ onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const start = Date.now();

    await onRefresh();

    // mimic your old "minimum spinner time"
    const elapsed = Date.now() - start;
    const delay = Math.max(500 - elapsed, 0);

    setTimeout(() => setLoading(false), delay);
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded"
    >
      {loading ? (
        <span className="animate-spin"><ArrowPathIcon className="w-4 h-5 text-white" /></span>
      ) : (
        <span><ArrowPathIcon className="w-4 h-5 text-white" /></span>
      )}
    </button>
  );
}