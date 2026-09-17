"use client";

import { use } from "react";
import MultiviewClient from "@/components/multiview/MultiviewClient";

function normalizeParams(param) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export default function GamedayPage({ searchParams }) {
  const params = use(searchParams);

  const eventKeys = normalizeParams(params?.event);

  if (!eventKeys.length) {
    return <EmptyState />;
  }

  return (
    <MultiviewClient
      events={eventKeys}
      isDivisional={false}
    />
  );
}

function EmptyState({
  title = "No events selected",
  detail = "Choose an event from the FieldView home page.",
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md text-center">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 text-sm text-neutral-500">{detail}</div>
      </div>
    </div>
  );
}