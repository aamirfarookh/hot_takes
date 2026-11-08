"use client";

import React from "react";
import { Zap, UserCheck, Play } from "lucide-react";

export type DemoPersona = "live" | "rusher" | "thoughtful";

interface DemoModeToggleProps {
  currentPersona: DemoPersona;
  onSelectPersona: (persona: DemoPersona) => void;
}

export default function DemoModeToggle({
  currentPersona,
  onSelectPersona,
}: DemoModeToggleProps) {
  return (
    <div className="flex items-center justify-between p-1.5 rounded-xl bg-stone-100/90 border border-stone-200 text-xs w-full">
      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider pl-2">
        Demo Persona:
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectPersona("live")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            currentPersona === "live"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Live Play
        </button>

        <button
          type="button"
          onClick={() => onSelectPersona("rusher")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            currentPersona === "rusher"
              ? "bg-rose-50 text-rose-800 border border-rose-200 font-semibold shadow-xs"
              : "text-stone-500 hover:text-rose-700"
          }`}
          title="Simulate bot or speedrunner (rapid clicks, position bias)"
        >
          <Zap className="w-3 h-3 text-rose-500" />
          <span>Rusher</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPersona("thoughtful")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            currentPersona === "thoughtful"
              ? "bg-stone-900 text-white shadow-xs font-semibold"
              : "text-stone-500 hover:text-stone-800"
          }`}
          title="Simulate thoughtful, deliberate human respondent"
        >
          <UserCheck className="w-3 h-3 text-stone-300" />
          <span>Thoughtful</span>
        </button>
      </div>
    </div>
  );
}
