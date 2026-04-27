"use client";

import { useEffect, useState } from "react";

export default function CastReceiverPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const cast = (window as any).cast;
    if (!cast?.framework) return;

    const context = cast.framework.CastReceiverContext.getInstance();

    const channelHandler = (event: any) => {
      const message = event.data;

      console.log("CAST MESSAGE:", message);
      setData(message);
    };

    context.addCustomMessageListener(
      "urn:x-cast:frc.multiview",
      channelHandler
    );

    context.start();

    return () => {
      // Cast receiver lifecycle managed by platform
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">FieldView Receiver</h1>

        <pre className="mt-4 text-sm opacity-80">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}