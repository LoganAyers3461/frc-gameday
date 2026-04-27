"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setCastSession } from "@/lib/cast/castClient";

const appId = process.env.NEXT_PUBLIC_CAST_APP_ID;

type CastState = "idle" | "available" | "connecting" | "connected" | "error";

export function useCastSession() {
  const sessionRef = useRef<any>(null);
  const contextRef = useRef<any>(null);

  const [state, setState] = useState<CastState>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    const initCast = () => {
      const cast = (window as any).cast;

      if (!cast?.framework) return false;

      const context = cast.framework.CastContext.getInstance();
      contextRef.current = context;

      context.setOptions({
        receiverApplicationId: appId,
        autoJoinPolicy: (window as any).chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      const onSessionChange = (e: any) => {
        const session = context.getCurrentSession();
        sessionRef.current = session;
        setCastSession(session);

        const SessionState = cast.framework.SessionState;

        switch (e.sessionState) {
          case SessionState.SESSION_STARTED:
          case SessionState.SESSION_RESUMED:
            setState("connected");
            break;

          case SessionState.SESSION_STARTING:
            setState("connecting");
            break;

          case SessionState.SESSION_START_FAILED:
          case SessionState.SESSION_ENDED:
            setState("available");
            sessionRef.current = null;
            setCastSession(null);
            break;

          default:
            setState("available");
        }
      };

      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        onSessionChange
      );

      setState("available");

      return true;
    };

    // retry until Cast exists (important on Vercel / fast hydration)
    const interval = setInterval(() => {
      if (!mounted) return;

      const success = initCast();
      if (success) clearInterval(interval);
    }, 200);

    return () => {
      mounted = false;
      clearInterval(interval);

      const cast = (window as any).cast;
      const context = contextRef.current;

      if (cast?.framework && context) {
        context.removeEventListener(
          cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          () => {}
        );
      }
    };
  }, []);

  const startCast = useCallback(async () => {
    try {
      const context = contextRef.current;
      const cast = (window as any).cast;

      if (!context || !cast?.framework) {
        console.warn("Cast not ready yet");
        return;
      }

      setState("connecting");

      const session = await context.requestSession();

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