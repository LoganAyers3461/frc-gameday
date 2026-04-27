"use client";

import { useEffect, useState } from "react";
import GridRenderer from "@/components/cast/GridRenderer";

export default function CastReceiverPage() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const context = (window as any).cast.framework.CastReceiverContext.getInstance();

    context.addCustomMessageListener(
      "urn:x-cast:frc.multiview",
      (event:any) => {
        setState(event.data);
      }
    );

    context.start();
  }, []);

  if (!state) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Waiting for cast…
      </div>
    );
  }

  return <GridRenderer state={state} />;
}