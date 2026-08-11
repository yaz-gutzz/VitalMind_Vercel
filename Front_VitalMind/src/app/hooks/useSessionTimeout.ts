import { useEffect, useRef } from "react";
import { clearSession, getSession, SESSION_EXPIRED_EVENT, SESSION_TIMEOUT_MS, touchSession } from "../lib/session";

type UseSessionTimeoutOptions = {
  enabled: boolean;
  routeKey: string;
  onExpire: () => void;
};

export function useSessionTimeout({ enabled, routeKey, onExpire }: UseSessionTimeoutOptions) {
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let timeoutId: number | undefined;

    const clearTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

    const schedule = () => {
      clearTimer();

      const session = getSession();
      if (!session) {
        onExpireRef.current();
        return;
      }

      const elapsed = Date.now() - session.lastActivity;
      const remaining = Math.max(0, SESSION_TIMEOUT_MS - elapsed);

      timeoutId = window.setTimeout(() => {
        clearSession({ notify: true });
        onExpireRef.current();
      }, remaining);
    };

    const handleActivity = () => {
      const session = getSession();
      if (!session) {
        onExpireRef.current();
        return;
      }

      touchSession();
      schedule();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        schedule();
      }
    };

    const handleExpiredEvent = () => {
      clearTimer();
      onExpireRef.current();
    };

    schedule();

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "focus"] as const;
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredEvent);

    return () => {
      clearTimer();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredEvent);
    };
  }, [enabled, routeKey]);
}