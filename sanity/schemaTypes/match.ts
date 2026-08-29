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
      name: "competition",
      title: "Competition",
      type: "string",
      group: "info",
      initialValue: "Lliga Sènior Badalona",
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
      description: "Week number in the league (e.g. Jornada 5)",
      validation: (rule) => rule.min(1),
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
              description: "All positions they played in this match (in order)",
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
              positionPlayed: "positionPlayed",
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
      scoreHome: "score.home",
      scoreAway: "score.away",
      matchday: "matchday",
      media: "opponentCrest",
    },
    prepare({ date, opponent, homeOrAway, scoreHome, scoreAway, matchday, media }) {
      const formattedDate = date
        ? new Date(date).toLocaleDateString("ca-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
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

      const prefix = homeOrAway === "home" ? "vs" : "@";
      const jornada = matchday ? `J${matchday} · ` : "";

      return {
        title: `${prefix} ${opponent} — ${scoreText}`,
        subtitle: `${jornada}${formattedDate}`,
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
