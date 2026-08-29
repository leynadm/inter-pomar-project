"use client";

import { useDraggable } from "@dnd-kit/core";
import type { AvailablePlayer } from "@/lib/formations";

interface Props {
  player: AvailablePlayer;
}

export function PlayerChip({ player }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-all active:cursor-grabbing ${
        isDragging
          ? "border-green-400 bg-green-50 opacity-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
      }`}
    >
      <span className="w-5 text-right text-xs font-bold text-gray-400">
        {player.shirtNumber || "–"}
      </span>
      <span className="font-medium text-gray-800">
        {player.nickname || player.name}
      </span>
      <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
        {player.primaryPosition}
      </span>
    </div>
  );
}
