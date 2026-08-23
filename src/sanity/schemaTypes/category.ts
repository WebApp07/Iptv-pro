import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  groups: [{ name: "seo", title: "SEO" }],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "For example IPTV Guides or Troubleshooting.",
      validation: (rule) => rule.required().error("A title is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "The URL-safe identifier. Becomes /blog/category/your-slug - keep it short and keyword-rich, for example iptv-guides.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => [
        rule.required().error("A slug is required"),
        rule.custom((value) => {
          if (!value?.current) return true;
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
            ? true
            : "Use lowercase words separated by hyphens, with no spaces or special characters";
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "A sentence or two about what this category covers. Shown at the top of the category page.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      description: "Shown in search results. Leave empty to use the category title.",
      validation: (rule) =>
        rule.max(60).warning("Aim for 50-60 characters so the title is not truncated"),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      group: "seo",
      rows: 3,
      description: "Shown in search results. Leave empty to use the description.",
      validation: (rule) =>
        rule.max(160).warning("Aim for 140-160 characters so the description is not truncated"),
    }),
    defineField({
      name: "image",
      title: "Featured image",
      type: "image",
      group: "seo",
      options: { hotspot: true },
      description: "Optional image used as the social sharing preview for the category.",
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "image",
    },
  },
});
