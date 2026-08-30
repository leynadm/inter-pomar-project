import { defineType, defineField } from "sanity";
import { positions } from "@/lib/football-constants";

const positionOptions = positions.map((p) => ({
  title: p.title,
  value: p.value,
}));

export const match = defineType({
  name: "match",
  title: "Match",
  type: "document",
  groups: [
    { name: "info", title: "Match Info", default: true },
    { name: "result", title: "Result & Stats" },
    { name: "media", title: "Media" },
  ],
  fields: [
    // ── Match Info ────────────────────────────────────────────────────────
    defineField({
      name: "date",
      title: "Date & Time",
      type: "datetime",
      group: "info",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "season",
      title: "Season",
      description: "e.g. 2025/26, 2026/27",
      type: "string",
      group: "info",
      options: {
        list: [
          { title: "2024/25", value: "2024-2025" },
          { title: "2025/26", value: "2025-2026" },
          { title: "2026/27", value: "2026-2027" },
        ],
      },
      initialValue: "2025-2026",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "competition",
      title: "Competition",
      type: "string",
      group: "info",
      options: {
        list: [
          { title: "Lliga Sènior Badalona (League)", value: "league" },
          { title: "Partit Amistós (Friendly)", value: "friendly" },
          { title: "Copa (Cup)", value: "cup" },
          { title: "Torneig (Tournament)", value: "tournament" },
        ],
      },
      initialValue: "league",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "opponent",
      title: "Opponent",
      type: "string",
      group: "info",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "opponentCrest",
      title: "Opponent Crest",
      type: "image",
      group: "info",
    }),

    defineField({
      name: "homeOrAway",
      title: "Home / Away",
      type: "string",
      group: "info",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Away", value: "away" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "venue",
      title: "Venue",
      type: "string",
      group: "info",
    }),

    defineField({
      name: "matchday",
      title: "Matchday / Jornada",
      type: "number",
      group: "info",
      description: "Only applicable for League matches",
      hidden: ({ parent }) => parent?.competition !== "league",
      validation: (rule) =>
        rule.custom((val, context) => {
          const parent = context.parent as { competition?: string };
          if (parent?.competition === "league" && (!val || val < 1)) {
            return "Matchday is required for league matches";
          }
          return true;
        }),
    }),

    // ── Result & Stats ───────────────────────────────────────────────────
    defineField({
      name: "score",
      title: "Score",
      description: "Leave empty for upcoming matches",
      type: "object",
      group: "result",
      fields: [
        defineField({
          name: "home",
          title: "Inter Pomar",
          type: "number",
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: "away",
          title: "Opponent",
          type: "number",
          validation: (rule) => rule.min(0),
        }),
      ],
    }),

    defineField({
      name: "formation",
      title: "Formation Used",
      type: "string",
      group: "result",
      description: "e.g. 4-3-3, 4-4-2, 3-5-2",
    }),

    defineField({
      name: "appearances",
      title: "Appearances",
      description: "Players who participated in this match",
      type: "array",
      group: "result",
      of: [
        {
          type: "object",
          name: "appearance",
          fields: [
            defineField({
              name: "player",
              title: "Player",
              type: "reference",
              to: [{ type: "player" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "positionsPlayed",
              title: "Positions Played",
              type: "array",
              description: "All positions played in order",
              of: [
                {
                  type: "string",
                  options: { list: positionOptions },
                },
              ],
              validation: (rule) => rule.min(1),
            }),
            defineField({
              name: "started",
              title: "Started",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "goals",
              title: "Goals",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.min(0),
            }),
            defineField({
              name: "assists",
              title: "Assists",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.min(0),
            }),
            defineField({
              name: "yellowCard",
              title: "Yellow Card",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "redCard",
              title: "Red Card",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              playerName: "player.name",
              playerNumber: "player.shirtNumber",
              goals: "goals",
              assists: "assists",
              started: "started",
              positionsPlayed: "positionsPlayed",
              media: "player.photo",
            },
            prepare({
              playerName,
              playerNumber,
              goals,
              assists,
              started,
              positionsPlayed,
              media,
            }) {
              const parts: string[] = [];
              if (positionsPlayed?.length) parts.push(positionsPlayed.join(" → "));
              if (!started) parts.push("SUB");
              if (goals && goals > 0) parts.push(`${goals}⚽`);
              if (assists && assists > 0) parts.push(`${assists}🅰️`);
              return {
                title: playerNumber
                  ? `${playerNumber}. ${playerName}`
                  : playerName || "Select player",
                subtitle: parts.join(" · ") || (started ? "Started" : "Sub"),
                media,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "notes",
      title: "Match Notes",
      description: "Brief summary or notes about the match",
      type: "text",
      group: "result",
      rows: 3,
    }),

    // ── Media ────────────────────────────────────────────────────────────
    defineField({
      name: "matchVideoUrl",
      title: "Full Match Video (YouTube URL)",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "highlightsVideoUrl",
      title: "Highlights Video (YouTube URL)",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "photos",
      title: "Match Photos",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      date: "date",
      opponent: "opponent",
      homeOrAway: "homeOrAway",
      competition: "competition",
      season: "season",
      scoreHome: "score.home",
      scoreAway: "score.away",
      matchday: "matchday",
      media: "opponentCrest",
    },
    prepare({
      date,
      opponent,
      homeOrAway,
      competition,
      scoreHome,
      scoreAway,
      matchday,
      media,
    }) {
      const formattedDate = date
        ? new Date(date).toLocaleDateString("ca-ES", {
          day: "numeric",
          month: "short",
        })
        : "TBD";

      const hasScore =
        scoreHome !== undefined &&
        scoreHome !== null &&
        scoreAway !== undefined &&
        scoreAway !== null;

      const scoreText = hasScore
        ? homeOrAway === "home"
          ? `${scoreHome} - ${scoreAway}`
          : `${scoreAway} - ${scoreHome}`
        : "Upcoming";

      const compTag =
        competition === "friendly"
          ? "🤝 Amistós"
          : competition === "cup"
            ? "🏆 Copa"
            : matchday
              ? `J${matchday}`
              : "Lliga";

      return {
        title: `${homeOrAway === "home" ? "vs" : "@"} ${opponent} (${scoreText})`,
        subtitle: `${compTag} · ${formattedDate}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Date (oldest first)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
});
