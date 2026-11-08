import { NextRequest, NextResponse } from "next/server";
import { recordTelemetryEvents, getRecentEvents, getEventsForSession } from "@/lib/eventLogger";
import type { BehavioralTelemetryEvent } from "@/types/telemetry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events: BehavioralTelemetryEvent[] = Array.isArray(body) ? body : [body];

    if (!events.length || !events[0].sessionId || !events[0].eventType) {
      return NextResponse.json({ error: "Invalid telemetry payload" }, { status: 400 });
    }

    recordTelemetryEvents(events);

    return NextResponse.json({ success: true, count: events.length }, { status: 200 });
  } catch (error) {
    console.error("[API Events POST error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const events = getEventsForSession(sessionId);
      return NextResponse.json({ sessionId, events });
    }

    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const events = getRecentEvents(limit);
    return NextResponse.json({ count: events.length, events });
  } catch (error) {
    console.error("[API Events GET error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
