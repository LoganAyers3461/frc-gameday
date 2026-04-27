"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setCastSession } from "@/lib/cast/castClient";
const appId = process.env.NEXT_PUBLIC_CAST_APP_ID;
//console.log("CAST APP ID:", appId);
type CastState =
  | "idle"
  | "available"
  | "connecting"
  | "connected"
  | "error";

export function useCastSession() {
  const sessionRef = useRef<any>(null);
  const contextRef = useRef<any>(null);

  const [state, setState] = useState<CastState>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cast = (window as any).cast;
    if (!cast?.framework) {
      setState("idle");
      return;
    }

    const context = cast.framework.CastContext.getInstance();
    contextRef.current = context;

    context.setOptions({
      receiverApplicationId: appId,
      autoJoinPolicy:
        (window as any).chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    const onSessionChange = (e: any) => {
      const session = context.getCurrentSession();
      sessionRef.current = session;
      setCastSession(session);

      switch (e.sessionState) {
        case "SESSION_STARTED":
          setState("connected");
          break;

        case "SESSION_STARTING":
          setState("connecting");
          break;

        case "SESSION_START_FAILED":
          setState("error");
          break;

        case "NO_SESSION":
          setState("available");
          sessionRef.current = null;
          setCastSession(null);
          break;
      }
    };

    context.addEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      onSessionChange
    );

    setState("available");

    return () => {
      context.removeEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        onSessionChange
      );
    };
  }, []);

  const startCast = useCallback(async () => {
    try {
      if (!contextRef.current) return;

      setState("connecting");

      const session =
        await contextRef.current.requestSession();

      sessionRef.current = session;
      setCastSession(session);

      setState("connected");

      return session;
    } catch (e) {
      console.error("Cast requestSession failed:", e);
      setState("error");
    }
  }, []);

  const endCast = useCallback(() => {
    try {
      sessionRef.current?.endSession(true);
      sessionRef.current = null;
      setCastSession(null);
      setState("available");
    } catch (e) {
      console.error("Cast end failed:", e);
    }
  }, []);

  return {
    state,
    startCast,
    endCast,
    session: sessionRef.current,
  };
}