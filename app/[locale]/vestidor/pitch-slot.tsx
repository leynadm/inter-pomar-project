"use client";

import { useDroppable } from "@dnd-kit/core";
import type { FormationSlot, AvailablePlayer } from "@/lib/formations";

interface Props {
  slot: FormationSlot;
  player: AvailablePlayer | null;
}

export function PitchSlot({ slot, player }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.id });

  return (
    <div
      ref={setNodeRef}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
      }}
    >
      {/* Player circle */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold shadow-md transition-all sm:h-12 sm:w-12 ${
          player
            ? "border-white bg-white text-[#1B6B33]"
            : isOver
              ? "border-white bg-white/40 text-white"
              : "border-white/50 bg-white/20 text-white/70"
        }`}
      >
        {player ? player.shirtNumber || "?" : slot.label}
      </div>

      {/* Name label */}
      <span
        className={`mt-0.5 max-w-[5rem] truncate text-center text-[10px] font-semibold leading-tight sm:text-xs ${
          player ? "text-white" : "text-white/50"
        }`}
      >
        {player
          ? (player.nickname || player.name.split(" ").pop())
          : ""}
      </span>
    </div>
  );
}
