/**
 * The crest has vertical bars of uneven height. This reproduces that rhythm as
 * a reusable structural element: bars anchored to the bottom edge, rising into
 * whatever sits above them.
 *
 * Use it as a hero base (`align="bottom"`), a section divider, or a card edge.
 */

const HEIGHTS = [
  0.45, 0.9, 0.3, 1, 0.62, 0.22, 0.85, 0.5, 1, 0.35, 0.72, 0.28, 0.95, 0.55,
  0.4, 0.88, 0.25, 1, 0.6, 0.32, 0.78, 0.48, 0.92, 0.26,
];

export function StripeRail({
  height = 56,
  align = "bottom",
  tone = "chalk",
  className = "",
}: {
  height?: number;
  align?: "bottom" | "top";
  tone?: "chalk" | "club" | "sand";
  className?: string;
}) {
  const bar =
    tone === "club"
      ? "bg-club"
      : tone === "sand"
        ? "bg-sand"
        : "bg-chalk";

  return (
    <div
      aria-hidden
      className={`flex w-full gap-0.75 ${align === "bottom" ? "items-end" : "items-start"
        } ${className}`}
      style={{ height }}
    >
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`flex-1 ${bar}`}
          style={{ height: `${h * 100}%`, opacity: 0.1 + h * 0.14 }}
        />
      ))}
    </div>
  );
}
