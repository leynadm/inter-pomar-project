"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { domToPng } from "modern-screenshot";
import {
  formations,
  autoPlace,
  type Formation,
  type AvailablePlayer,
  type SlotAssignment,
} from "@/lib/formations";
import { PitchSlot } from "./pitch-slot";
import { PlayerChip } from "./player-chip";

interface Props {
  players: AvailablePlayer[];
}

export function FormationBuilder({ players }: Props) {
  // ── State ───────────────────────────────────────────────────────────
  const [formation, setFormation] = useState<Formation>(formations[0]);
  const [available, setAvailable] = useState<Set<string>>(
    new Set(players.map((p) => p._id))
  );
  const [assignments, setAssignments] = useState<SlotAssignment[]>(
    formation.slots.map((s) => ({ slotId: s.id, player: null }))
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // ── Derived ─────────────────────────────────────────────────────────
  const availablePlayers = players.filter((p) => available.has(p._id));
  const assignedIds = new Set(
    assignments.filter((a) => a.player).map((a) => a.player!._id)
  );
  const bench = availablePlayers.filter((p) => !assignedIds.has(p._id));

  // ── Handlers ────────────────────────────────────────────────────────

  function toggleAvailable(playerId: string) {
    setAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
        // Also remove from pitch if assigned
        setAssignments((a) =>
          a.map((slot) =>
            slot.player?._id === playerId
              ? { ...slot, player: null }
              : slot
          )
        );
      } else {
        next.add(playerId);
      }
      return next;
    });
  }

  function switchFormation(f: Formation) {
    setFormation(f);
    setAssignments(f.slots.map((s) => ({ slotId: s.id, player: null })));
  }

  function handleAutoPlace() {
    const result = autoPlace(formation, availablePlayers);
    setAssignments(result);
  }

  function clearPitch() {
    setAssignments(
      formation.slots.map((s) => ({ slotId: s.id, player: null }))
    );
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const playerId = active.id as string;
    const targetSlotId = over.id as string;
    const player = players.find((p) => p._id === playerId);
    if (!player) return;

    setAssignments((prev) => {
      const next = prev.map((a) => {
        // Remove player from any current slot
        if (a.player?._id === playerId) return { ...a, player: null };
        return a;
      });
      // Place in target slot
      return next.map((a) =>
        a.slotId === targetSlotId ? { ...a, player } : a
      );
    });
  }

  // ── Export ───────────────────────────────────────────────────────────

  async function exportImage() {
    if (!pitchRef.current) return;
    try {
      const dataUrl = await domToPng(pitchRef.current, {
        scale: 2,
        backgroundColor: "#1B6B33",
      });
      // Create download link
      const link = document.createElement("a");
      link.download = `inter-pomar-lineup-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  // ── Active drag player for overlay ──────────────────────────────────
  const activePlayer = activeId
    ? players.find((p) => p._id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {formations.map((f) => (
            <button
              key={f.name}
              onClick={() => switchFormation(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                formation.name === f.name
                  ? "bg-[#1B6B33] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleAutoPlace}
              className="rounded-md bg-[#1B6B33] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#14522A]"
            >
              Auto-place
            </button>
            <button
              onClick={clearPitch}
              className="rounded-md bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Clear
            </button>
            <button
              onClick={exportImage}
              className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
            >
              📸 Export PNG
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* ── Pitch ────────────────────────────────────────────── */}
          <div
            ref={pitchRef}
            className="relative aspect-[68/105] overflow-hidden rounded-lg bg-[#2D8B4E] shadow-lg"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "10% 10%",
            }}
          >
            {/* Pitch markings */}
            <svg
              viewBox="0 0 680 1050"
              className="absolute inset-0 h-full w-full"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            >
              {/* Outer boundary */}
              <rect x="40" y="40" width="600" height="970" />
              {/* Center line */}
              <line x1="40" y1="525" x2="640" y2="525" />
              {/* Center circle */}
              <circle cx="340" cy="525" r="91.5" />
              <circle cx="340" cy="525" r="3" fill="rgba(255,255,255,0.3)" />
              {/* Top penalty area */}
              <rect x="178" y="40" width="324" height="165" />
              <rect x="240" y="40" width="200" height="55" />
              <circle cx="340" cy="157" r="3" fill="rgba(255,255,255,0.3)" />
              {/* Bottom penalty area */}
              <rect x="178" y="845" width="324" height="165" />
              <rect x="240" y="955" width="200" height="55" />
              <circle cx="340" cy="893" r="3" fill="rgba(255,255,255,0.3)" />
              {/* Corner arcs */}
              <path d="M40,52 Q52,52 52,40" />
              <path d="M640,52 Q628,52 628,40" />
              <path d="M40,998 Q52,998 52,1010" />
              <path d="M640,998 Q628,998 628,1010" />
            </svg>

            {/* Formation title overlay */}
            <div className="absolute left-3 top-3 rounded bg-black/30 px-2 py-1 text-xs font-bold text-white">
              {formation.label}
            </div>
            <div className="absolute right-3 top-3 rounded bg-black/30 px-2 py-1 text-xs text-white/80">
              Inter Pomar
            </div>

            {/* Slots */}
            {formation.slots.map((slot) => {
              const assignment = assignments.find(
                (a) => a.slotId === slot.id
              );
              return (
                <PitchSlot
                  key={slot.id}
                  slot={slot}
                  player={assignment?.player || null}
                />
              );
            })}
          </div>

          {/* ── Sidebar: Player List ─────────────────────────────── */}
          <div className="space-y-4">
            {/* Bench / unassigned available players */}
            <div className="rounded-lg border bg-white p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Banqueta ({bench.length})
              </h3>
              <div className="space-y-1">
                {bench.map((p) => (
                  <PlayerChip key={p._id} player={p} />
                ))}
                {bench.length === 0 && (
                  <p className="py-2 text-center text-xs text-gray-400">
                    Tots els jugadors col·locats
                  </p>
                )}
              </div>
            </div>

            {/* Full squad — toggle availability */}
            <div className="rounded-lg border bg-white p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Convocatòria ({availablePlayers.length}/{players.length})
              </h3>
              <div className="max-h-64 space-y-0.5 overflow-y-auto">
                {players.map((p) => (
                  <label
                    key={p._id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={available.has(p._id)}
                      onChange={() => toggleAvailable(p._id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-green-700 focus:ring-green-600"
                    />
                    <span className="w-5 text-right text-xs text-gray-400">
                      {p.shirtNumber || "–"}
                    </span>
                    <span className="text-sm">{p.nickname || p.name}</span>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {p.primaryPosition}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activePlayer && (
          <div className="rounded bg-white px-2 py-1 text-sm font-medium shadow-lg">
            {activePlayer.shirtNumber}. {activePlayer.nickname || activePlayer.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
