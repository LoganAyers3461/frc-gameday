"use client";

import { useEffect, useState } from "react";
import GridRenderer from "@/components/cast/GridRenderer";

export default function CastReceiverPage() {
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("booting");

  useEffect(() => {
    const init = async () => {
      // WAIT until Cast runtime exists
      const tryCast = () => (window as any).cast;

      let attempts = 0;

      const waitForCast = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            const cast = tryCast();

            attempts++;

            if (cast?.framework?.CastReceiverContext) {
              clearInterval(interval);
              resolve(cast);
            }

            if (attempts > 20) {
              clearInterval(interval);
              resolve(null);
            }
          }, 200);
        });

      const cast = await waitForCast() as any;

      if (!cast) {
        setStatus("no-cast");
        return;
      }

      const context = cast.framework.CastReceiverContext.getInstance();

      context.addCustomMessageListener(
        "urn:x-cast:frc.multiview",
        (event: any) => {
          setState(event.data);
        }
      );

      context.start();

      setStatus("ready");
    };

    init();
  }, []);

  if (status === "no-cast") {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div>
          <p className="text-lg font-bold">Cast Receiver Not Active</p>
          <p className="text-sm text-gray-400">
            This page only works when opened via a Chromecast device.
          </p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Waiting for Cast session...
      </div>
    );
  }

  return <GridRenderer state={state} />;
}