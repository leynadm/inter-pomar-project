import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Scorer = {
  _id: string;
  name: string;
  slug: string;
  photoUrl?: string;
  goals: number;
  assists?: number;
};

type Totals = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: ("W" | "D" | "L")[];
};

export function SeasonPanel({
  totals,
  scorers,
  copy,
}: {
  totals?: Totals;
  scorers: Scorer[];
  copy: {
    season: string;
    played: string;
    record: string;
    goalsFor: string;
    goalsAgainst: string;
    form: string;
    scorers: string;
    goals: string;
    noScorers: string;
  };
}) {
  const t: Totals = totals ?? {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    form: [],
  };

  const topGoals = scorers[0]?.goals ?? 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      {/* ── Season stats card ────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <Stat label={copy.played} value={t.played} />
          <Stat
            label={copy.record}
            value={`${t.won}-${t.drawn}-${t.lost}`}
          />
          <Stat label={copy.goalsFor} value={t.goalsFor} />
          <Stat label={copy.goalsAgainst} value={t.goalsAgainst} />
        </div>

        {/* Win percentage bar */}
        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-pitch transition-all duration-500"
              style={{
                width: `${t.played ? (t.won / t.played) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            {t.played ? Math.round((t.won / t.played) * 100) : 0}%{" "}
            {copy.record}
          </p>
        </div>

        {/* Form strip */}
        <div className="mt-6 border-t border-neutral-100 pt-5">
          <div className="flex items-center gap-3">
            <p className="label text-neutral-400">{copy.form}</p>
            <div className="flex gap-2">
              {t.form.map((r, i) => (
                <span
                  key={i}
                  title={r === "W" ? "Win" : r === "D" ? "Draw" : "Loss"}
                  className={`display flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white ${r === "W"
                      ? "bg-result-win"
                      : r === "D"
                        ? "bg-result-draw"
                        : "bg-result-loss"
                    }`}
                >
                  {r}
                </span>
              ))}
              {t.form.length === 0 && (
                <span className="text-xs text-neutral-300">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top scorers card ─────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <p className="label text-neutral-400">{copy.scorers}</p>

        {scorers.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">
            {copy.noScorers}
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {scorers.slice(0, 5).map((p, i) => (
              <li key={p._id}>
                <Link
                  href={`/plantilla/${p.slug}`}
                  className="group flex items-center gap-3 rounded-lg p-1 -mx-1 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-pitch"
                >
                  <span className="numeric w-5 text-center text-sm text-neutral-400">
                    {i + 1}
                  </span>

                  <Avatar className="size-9 border border-neutral-100">
                    <AvatarImage src={p.photoUrl} alt="" />
                    <AvatarFallback className="bg-green-50 text-xs text-pitch">
                      {p.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800 group-hover:underline">
                      {p.name}
                    </p>
                    <div className="mt-1.5 h-1 rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-pitch/70"
                        style={{
                          width: `${topGoals ? (p.goals / topGoals) * 100 : 0}%`,
                          minWidth: "8px",
                        }}
                      />
                    </div>
                  </div>

                  <span className="numeric text-lg text-neutral-800">
                    {p.goals}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="numeric text-3xl leading-none text-neutral-800">{value}</p>
      <p className="label mt-2 text-neutral-400">{label}</p>
    </div>
  );
}
