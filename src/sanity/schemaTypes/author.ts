import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().error("A name is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used for author pages and URLs.",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required().error("A slug is required"),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description: "A square portrait works best.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
      description: "Short bio shown at the end of articles.",
    }),
    defineField({
      name: "twitter",
      title: "Twitter / X handle",
      type: "string",
      description: "Optional, without the @ symbol.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "image",
    },
  },
});