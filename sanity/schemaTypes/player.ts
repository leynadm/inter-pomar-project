import { defineType, defineField } from "sanity";
import {
  positions,
  strengths,
  strengthCategories,
  countries,
} from "@/lib/football-constants";

const strengthOptions = strengthCategories.map((cat) => ({
  title: cat.charAt(0).toUpperCase() + cat.slice(1),
  items: strengths
    .filter((s) => s.category === cat)
    .map((s) => ({ title: s.title, value: s.value })),
}));

const flatStrengthOptions = strengths.map((s) => ({
  title: `${s.category.charAt(0).toUpperCase() + s.category.slice(1)} › ${s.title}`,
  value: s.value,
}));

const positionOptions = positions.map((p) => ({
  title: p.title,
  value: p.value,
}));

const countryOptions = countries.map((c) => ({
  title: c.title,
  value: c.value,
}));

export const player = defineType({
  name: "player",
  title: "Player",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "positions", title: "Positions" },
    { name: "strengths", title: "Strengths" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      group: "basic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "nickname",
      title: "Nickname",
      type: "string",
      group: "basic",
      description: "How teammates call them (optional)",
    }),
    defineField({
      name: "shirtNumber",
      title: "Shirt Number",
      type: "number",
      group: "basic",
      validation: (rule) => rule.min(1).max(99),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      group: "basic",
      options: { hotspot: true },
    }),
    defineField({
      name: "nationality",
      title: "Nationality",
      type: "string",
      group: "basic",
      description: "Select country (flag will display automatically via flagcdn)",
      options: {
        list: countryOptions,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "secondNationality",
      title: "Second Nationality",
      type: "string",
      group: "basic",
      options: {
        list: countryOptions,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "preferredFoot",
      title: "Preferred Foot",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Right", value: "right" },
          { title: "Left", value: "left" },
          { title: "Both", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "right",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      group: "basic",
      description: "Optional short description (background, personality, how they joined the team)",
      rows: 4,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Injured", value: "injured" },
          { title: "Unavailable", value: "unavailable" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),

    defineField({
      name: "primaryPosition",
      title: "Primary Position",
      type: "string",
      group: "positions",
      options: { list: positionOptions, layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryPositions",
      title: "Secondary Positions",
      type: "array",
      group: "positions",
      description: "Other positions this player can cover",
      of: [
        {
          type: "string",
          options: { list: positionOptions },
        },
      ],
      validation: (rule) => rule.unique(),
    }),

    defineField({
      name: "strengths",
      title: "Strengths",
      type: "array",
      group: "strengths",
      description:
        "Select qualities that describe this player. Grouped by: Physical, Defending, Passing, Dribbling, Shooting, Goalkeeping, Mental.",
      of: [
        {
          type: "string",
          options: { list: flatStrengthOptions },
        },
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      position: "primaryPosition",
      media: "photo",
      shirtNumber: "shirtNumber",
      nationality: "nationality",
    },
    prepare({ title, position, media, shirtNumber, nationality }) {
      const flag = nationality ? ` 🏴 ${nationality.toUpperCase()}` : "";
      return {
        title: shirtNumber ? `${shirtNumber}. ${title}` : title,
        subtitle: `${position || "—"}${flag}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Shirt Number",
      name: "shirtNumberAsc",
      by: [{ field: "shirtNumber", direction: "asc" }],
    },
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Position",
      name: "positionAsc",
      by: [{ field: "primaryPosition", direction: "asc" }],
    },
  ],
});
