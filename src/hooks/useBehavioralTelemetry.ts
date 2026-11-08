"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  BehavioralTelemetryEvent,
  BehavioralEventType,
} from "@/types/telemetry";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useBehavioralTelemetry() {
  const [sessionId] = useState<string>(() => generateId("ses"));
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ht_anon_uid");
      if (stored) return stored;
      const created = generateId("usr");
      localStorage.setItem("ht_anon_uid", created);
      return created;
    }
    return generateId("usr");
  });

  const [events, setEvents] = useState<BehavioralTelemetryEvent[]>([]);
  const lastEventTsRef = useRef<number>(Date.now());
  const pendingBufferRef = useRef<BehavioralTelemetryEvent[]>([]);
  const tabBlurCountRef = useRef<number>(0);

  // Flush buffer to backend /api/events
  const flushBuffer = useCallback(() => {
    if (pendingBufferRef.current.length === 0) return;
    const batch = [...pendingBufferRef.current];
    pendingBufferRef.current = [];

    try {
      if (typeof window !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(batch)], { type: "application/json" });
        navigator.sendBeacon("/api/events", blob);
      } else {
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
          keepalive: true,
        }).catch((err) => console.warn("[Telemetry] Flush failed:", err));
      }
    } catch (err) {
      console.warn("[Telemetry] Beacon error:", err);
    }
  }, []);

  // Flush on interval or page unload
  useEffect(() => {
    const interval = setInterval(flushBuffer, 3000);
    const handleUnload = () => flushBuffer();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      flushBuffer();
    };
  }, [flushBuffer]);

  // Record a typed behavioral event
  const recordEvent = useCallback(
    (
      eventType: BehavioralEventType,
      screenId: string,
      payload: Record<string, unknown> = {}
    ) => {
      const now = Date.now();
      const latencyMs = Math.max(0, now - lastEventTsRef.current);
      lastEventTsRef.current = now;

      const event: BehavioralTelemetryEvent = {
        sessionId,
        userId,
        timestamp: now,
        screenId,
        latencyMs,
        eventType,
        payload,
      };

      setEvents((prev) => [...prev, event]);
      pendingBufferRef.current.push(event);

      // Immediate flush for critical terminal events
      if (
        eventType === "session_complete" ||
        eventType === "session_start" ||
        eventType === "disruption_response"
      ) {
        flushBuffer();
      }
    },
    [sessionId, userId, flushBuffer]
  );

  // Track visibility / tab blur
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        tabBlurCountRef.current += 1;
        recordEvent("screen_view", "app", { action: "window_blur" });
      } else {
        recordEvent("screen_view", "app", { action: "window_focus" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [recordEvent]);

  return {
    sessionId,
    userId,
    events,
    recordEvent,
    tabBlurCount: tabBlurCountRef.current,
  };
}
