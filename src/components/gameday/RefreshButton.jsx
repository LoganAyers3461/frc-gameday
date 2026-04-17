"use client";

import { useState } from "react";

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
      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-2"
    >
      {loading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <span>⟳</span>
      )}
      Refresh
    </button>
  );
}