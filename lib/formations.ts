export interface FormationSlot {
  id: string;
  x: number;
  y: number;
  positionHints: string[];
  label: string;
}

export interface Formation {
  name: string;
  label: string;
  variant?: string;
  category: "balanced" | "attacking" | "defensive" | "wide" | "narrow" | "custom";
  slots: FormationSlot[];
}

export interface AvailablePlayer {
  _id: string;
  name: string;
  nickname?: string;
  shirtNumber?: number;
  primaryPosition: string;
  secondaryPositions?: string[];
  strengths?: string[];
  nationality?: string;
}

export interface SlotAssignment {
  slotId: string;
  player: AvailablePlayer | null;
}

const GK: FormationSlot = { id: "gk", x: 50, y: 92, positionHints: ["GK"], label: "GK" };

export const formations: Formation[] = [
  // ═══ FOUR AT THE BACK ═══
  {
    name: "4-2-3-1", label: "4–2–3–1", category: "balanced", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "dm1", x: 38, y: 58, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "dm2", x: 62, y: 58, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "lw", x: 18, y: 36, positionHints: ["LWF", "LMF", "AMF"], label: "LW" },
      { id: "am", x: 50, y: 38, positionHints: ["AMF", "CMF", "SS"], label: "AM" },
      { id: "rw", x: 82, y: 36, positionHints: ["RWF", "RMF", "AMF"], label: "RW" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-1-4-1", label: "4–1–4–1", category: "defensive", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "dm", x: 50, y: 62, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "lm", x: 14, y: 42, positionHints: ["LMF", "LWF"], label: "LM" },
      { id: "cm1", x: 38, y: 45, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "cm2", x: 62, y: 45, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "rm", x: 86, y: 42, positionHints: ["RMF", "RWF"], label: "RM" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-3-1-2", label: "4–3–1–2", category: "narrow", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "cm1", x: 30, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 50, y: 58, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm3", x: 70, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "am", x: 50, y: 38, positionHints: ["AMF", "SS"], label: "AM" },
      { id: "st1", x: 38, y: 20, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 20, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-1-2-1-2", label: "4–1–2–1–2", variant: "Narrow Diamond", category: "narrow", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "dm", x: 50, y: 63, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "cm1", x: 30, y: 48, positionHints: ["CMF", "LMF"], label: "CM" },
      { id: "cm2", x: 70, y: 48, positionHints: ["CMF", "RMF"], label: "CM" },
      { id: "am", x: 50, y: 35, positionHints: ["AMF", "SS"], label: "AM" },
      { id: "st1", x: 38, y: 19, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 19, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-4-1-1", label: "4–4–1–1", category: "defensive", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "lm", x: 14, y: 48, positionHints: ["LMF", "LWF"], label: "LM" },
      { id: "cm1", x: 38, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 62, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rm", x: 86, y: 48, positionHints: ["RMF", "RWF"], label: "RM" },
      { id: "ss", x: 50, y: 32, positionHints: ["SS", "AMF", "CF"], label: "SS" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-5-1", label: "4–5–1", category: "defensive", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "lm", x: 14, y: 45, positionHints: ["LMF", "LWF"], label: "LM" },
      { id: "cm1", x: 32, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 50, y: 48, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "cm3", x: 68, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rm", x: 86, y: 45, positionHints: ["RMF", "RWF"], label: "RM" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "4-2-2-2", label: "4–2–2–2", category: "attacking", slots: [
      GK,
      { id: "lb", x: 14, y: 73, positionHints: ["LB", "LMF"], label: "LB" },
      { id: "cb1", x: 36, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 64, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "rb", x: 86, y: 73, positionHints: ["RB", "RMF"], label: "RB" },
      { id: "dm1", x: 38, y: 58, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "dm2", x: 62, y: 58, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "am1", x: 32, y: 38, positionHints: ["AMF", "LWF", "CMF"], label: "AM" },
      { id: "am2", x: 68, y: 38, positionHints: ["AMF", "RWF", "CMF"], label: "AM" },
      { id: "st1", x: 38, y: 19, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 19, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  // ═══ THREE AT THE BACK ═══
  {
    name: "3-5-2", label: "3–5–2", category: "balanced", slots: [
      GK,
      { id: "cb1", x: 25, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 75, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "lwb", x: 10, y: 50, positionHints: ["LMF", "LB", "LWF"], label: "LWB" },
      { id: "cm1", x: 34, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 50, y: 50, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "cm3", x: 66, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rwb", x: 90, y: 50, positionHints: ["RMF", "RB", "RWF"], label: "RWB" },
      { id: "st1", x: 38, y: 21, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 21, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "3-4-3", label: "3–4–3", category: "attacking", slots: [
      GK,
      { id: "cb1", x: 25, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 75, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "lwb", x: 12, y: 50, positionHints: ["LMF", "LB", "LWF"], label: "LM" },
      { id: "cm1", x: 38, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 62, y: 52, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rwb", x: 88, y: 50, positionHints: ["RMF", "RB", "RWF"], label: "RM" },
      { id: "lw", x: 18, y: 24, positionHints: ["LWF", "LMF"], label: "LW" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
      { id: "rw", x: 82, y: 24, positionHints: ["RWF", "RMF"], label: "RW" },
    ]
  },
  {
    name: "3-4-1-2", label: "3–4–1–2", category: "attacking", slots: [
      GK,
      { id: "cb1", x: 25, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 75, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "lwb", x: 10, y: 50, positionHints: ["LMF", "LB"], label: "LWB" },
      { id: "cm1", x: 38, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 62, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rwb", x: 90, y: 50, positionHints: ["RMF", "RB"], label: "RWB" },
      { id: "am", x: 50, y: 36, positionHints: ["AMF", "SS"], label: "AM" },
      { id: "st1", x: 38, y: 19, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 19, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "3-4-2-1", label: "3–4–2–1", category: "balanced", slots: [
      GK,
      { id: "cb1", x: 25, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 75, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "lwb", x: 10, y: 50, positionHints: ["LMF", "LB"], label: "LWB" },
      { id: "cm1", x: 38, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 62, y: 55, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rwb", x: 90, y: 50, positionHints: ["RMF", "RB"], label: "RWB" },
      { id: "am1", x: 35, y: 32, positionHints: ["AMF", "LWF", "SS"], label: "AM" },
      { id: "am2", x: 65, y: 32, positionHints: ["AMF", "RWF", "SS"], label: "AM" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "3-1-4-2", label: "3–1–4–2", category: "balanced", slots: [
      GK,
      { id: "cb1", x: 25, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 75, y: 77, positionHints: ["CB"], label: "CB" },
      { id: "dm", x: 50, y: 63, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "lm", x: 14, y: 43, positionHints: ["LMF", "LWF"], label: "LM" },
      { id: "cm1", x: 38, y: 46, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "cm2", x: 62, y: 46, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "rm", x: 86, y: 43, positionHints: ["RMF", "RWF"], label: "RM" },
      { id: "st1", x: 38, y: 20, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 20, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  // ═══ FIVE AT THE BACK ═══
  {
    name: "5-3-2", label: "5–3–2", category: "defensive", slots: [
      GK,
      { id: "lwb", x: 10, y: 65, positionHints: ["LB", "LMF"], label: "LWB" },
      { id: "cb1", x: 28, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 72, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "rwb", x: 90, y: 65, positionHints: ["RB", "RMF"], label: "RWB" },
      { id: "cm1", x: 30, y: 50, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 50, y: 47, positionHints: ["CMF", "AMF"], label: "CM" },
      { id: "cm3", x: 70, y: 50, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "st1", x: 38, y: 22, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 22, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "5-4-1", label: "5–4–1", category: "defensive", slots: [
      GK,
      { id: "lwb", x: 10, y: 65, positionHints: ["LB", "LMF"], label: "LWB" },
      { id: "cb1", x: 28, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 72, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "rwb", x: 90, y: 65, positionHints: ["RB", "RMF"], label: "RWB" },
      { id: "lm", x: 14, y: 45, positionHints: ["LMF", "LWF"], label: "LM" },
      { id: "cm1", x: 38, y: 48, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "cm2", x: 62, y: 48, positionHints: ["CMF", "DMF"], label: "CM" },
      { id: "rm", x: 86, y: 45, positionHints: ["RMF", "RWF"], label: "RM" },
      { id: "st", x: 50, y: 17, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
  {
    name: "5-2-1-2", label: "5–2–1–2", category: "defensive", slots: [
      GK,
      { id: "lwb", x: 10, y: 65, positionHints: ["LB", "LMF"], label: "LWB" },
      { id: "cb1", x: 28, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "cb2", x: 50, y: 80, positionHints: ["CB"], label: "CB" },
      { id: "cb3", x: 72, y: 78, positionHints: ["CB"], label: "CB" },
      { id: "rwb", x: 90, y: 65, positionHints: ["RB", "RMF"], label: "RWB" },
      { id: "dm1", x: 38, y: 55, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "dm2", x: 62, y: 55, positionHints: ["DMF", "CMF"], label: "DM" },
      { id: "am", x: 50, y: 37, positionHints: ["AMF", "SS"], label: "AM" },
      { id: "st1", x: 38, y: 20, positionHints: ["CF", "SS"], label: "ST" },
      { id: "st2", x: 62, y: 20, positionHints: ["CF", "SS"], label: "ST" },
    ]
  },
];

// ─── Custom Formation ───────────────────────────────────────────────────────

export function createCustomFormation(
  name: string,
  slots: Array<{ x: number; y: number; label: string; positionHints: string[] }>
): Formation {
  return {
    name,
    label: name,
    category: "custom",
    slots: slots.map((s, i) => ({
      id: `custom-${i}`,
      ...s,
    })),
  };
}

// ─── Auto-placement (3-pass) ────────────────────────────────────────────────

export function autoPlace(
  formation: Formation,
  players: AvailablePlayer[]
): SlotAssignment[] {
  const pool = [...players];
  const result: SlotAssignment[] = formation.slots.map((s) => ({
    slotId: s.id,
    player: null,
  }));

  // Pass 1: primary position match
  for (const a of result) {
    const slot = formation.slots.find((s) => s.id === a.slotId)!;
    const i = pool.findIndex((p) => slot.positionHints.includes(p.primaryPosition));
    if (i !== -1) a.player = pool.splice(i, 1)[0];
  }

  // Pass 2: secondary position match
  for (const a of result) {
    if (a.player) continue;
    const slot = formation.slots.find((s) => s.id === a.slotId)!;
    const i = pool.findIndex((p) =>
      p.secondaryPositions?.some((sp) => slot.positionHints.includes(sp))
    );
    if (i !== -1) a.player = pool.splice(i, 1)[0];
  }

  // Pass 3: fill remaining gaps with whoever's left
  for (const a of result) {
    if (a.player || pool.length === 0) continue;
    a.player = pool.shift()!;
  }

  return result;
}

