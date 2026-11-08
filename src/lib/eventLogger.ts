/**
 * Event Ingestion & Persistence Engine
 * Supports In-Memory Ring Buffer + Local JSON Append
 */

import fs from "node:fs";
import path from "node:path";
import type { BehavioralTelemetryEvent } from "../types/telemetry.ts";

const EVENTS_FILE_PATH = path.join(process.cwd(), "data", "events.json");
const MAX_IN_MEMORY_EVENTS = 2000;

// In-memory event repository
const inMemoryEvents: BehavioralTelemetryEvent[] = [];

/**
 * Ensures the data directory and events file exist
 */
function ensureStorageReady(): void {
  try {
    const dir = path.dirname(EVENTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(EVENTS_FILE_PATH)) {
      fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.error("[EventLogger] Failed to initialize event file storage:", err);
  }
}

/**
 * Persists an event or batch of events to in-memory store and local JSON file
 */
export function recordTelemetryEvents(events: BehavioralTelemetryEvent | BehavioralTelemetryEvent[]): void {
  const eventList = Array.isArray(events) ? events : [events];
  if (eventList.length === 0) return;

  // 1. In-memory append
  for (const ev of eventList) {
    inMemoryEvents.push(ev);
    if (inMemoryEvents.length > MAX_IN_MEMORY_EVENTS) {
      inMemoryEvents.shift(); // Evict oldest
    }
  }

  // 2. Persist to local JSON file asynchronously
  try {
    ensureStorageReady();
    let currentData: BehavioralTelemetryEvent[] = [];
    if (fs.existsSync(EVENTS_FILE_PATH)) {
      const raw = fs.readFileSync(EVENTS_FILE_PATH, "utf8");
      if (raw.trim().length > 0) {
        currentData = JSON.parse(raw);
      }
    }

    currentData.push(...eventList);

    // Keep file bounded to last 5,000 events to prevent runaway disk usage
    if (currentData.length > 5000) {
      currentData = currentData.slice(-5000);
    }

    fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(currentData, null, 2), "utf8");
  } catch (err) {
    console.error("[EventLogger] Error writing events to disk:", err);
  }
}

/**
 * Retrieves all events for a session from memory
 */
export function getEventsForSession(sessionId: string): BehavioralTelemetryEvent[] {
  return inMemoryEvents.filter((e) => e.sessionId === sessionId);
}

/**
 * Retrieves latest events across sessions (for admin / researcher inspect)
 */
export function getRecentEvents(limit: number = 50): BehavioralTelemetryEvent[] {
  return inMemoryEvents.slice(-limit).reverse();
}
