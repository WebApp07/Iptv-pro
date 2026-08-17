import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO & sharing" },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "The headline of the article.",
      validation: (rule) => [
        rule.required().error("A title is required"),
        rule.max(100).warning("Keep titles under 100 characters"),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "The URL path of the article, for example what-is-iptv.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required().error("A slug is required"),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      group: "content",
      rows: 3,
      description: "A short summary shown on cards and in search results.",
      validation: (rule) => [
        rule.required().error("An excerpt is required"),
        rule.max(160).warning("Keep the excerpt under 160 characters"),
      ],
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "content",
      description: "The main image shown on cards and at the top of the article.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Describes the image for screen readers and search engines.",
          validation: (rule) => rule.required().error("Alternative text is required"),
        }),
        defineField({
          name: "caption",
          type: "string",
          title: "Caption",
          description: "Optional caption shown under the image.",
        }),
      ],
      validation: (rule) => rule.required().error("A featured image is required"),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      description: "The main article content.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Inline code", value: "code" },
            ],
            annotations: [
              defineField({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    type: "string",
                    title: "URL",
                    description:
                      "A full URL (https://...) or an internal path starting with /.",
                    validation: (rule) =>
                      rule.custom((value) => {
                        if (!value) return "A URL is required";
                        const valid = /^(https?:\/\/|\/)/.test(value);
                        return valid
                          ? true
                          : "Enter a full URL or a path starting with /";
                      }),
                  }),
                  defineField({
                    name: "openInNewTab",
                    type: "boolean",
                    title: "Open in a new tab",
                    initialValue: false,
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          name: "image",
          title: "Inline image",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alternative text",
            }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
            }),
          ],
        }),
        defineArrayMember({
          name: "code",
          title: "Code block",
          type: "object",
          fields: [
            defineField({
              name: "code",
              type: "text",
              title: "Code",
              rows: 8,
              validation: (rule) => rule.required().error("Code is required"),
            }),
            defineField({
              name: "language",
              type: "string",
              title: "Language",
              description: "For example bash, javascript or groq.",
            }),
            defineField({
              name: "filename",
              type: "string",
              title: "Filename",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      validation: (rule) =>
        rule.required().min(1).error("Add at least one category"),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "content",
      to: [{ type: "author" }],
      validation: (rule) => rule.required().error("An author is required"),
    }),
    defineField({
      name: "readingTime",
      title: "Estimated reading time",
      type: "number",
      group: "content",
      description: "In minutes. Leave empty to auto-calculate from the body.",
      validation: (rule) =>
        rule.integer().min(1).max(60).error("Enter a whole number of minutes"),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "publishing",
      description:
        "Draft posts are hidden from the public site. Published posts go live after the site cache refreshes (usually within a couple of minutes).",
      initialValue: "draft",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required().error("Choose a status"),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "publishing",
      description: "Shown on the article and used to order the blog.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required().error("A published date is required"),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated date",
      type: "datetime",
      group: "publishing",
      description: "When the article was last revised. Leave empty if never updated.",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true;
          const document = context.document as { publishedAt?: string } | undefined;
          if (document?.publishedAt && value < document.publishedAt) {
            return "The updated date must be on or after the published date";
          }
          return true;
        }),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      description: "Shown in search results. Leave empty to use the article title.",
      validation: (rule) => rule.max(60).warning("Aim for 60 characters or fewer"),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      group: "seo",
      rows: 3,
      description: "Shown in search results. Leave empty to use the excerpt.",
      validation: (rule) => rule.max(160).warning("Aim for 160 characters or fewer"),
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "A few keywords that describe the article.",
    }),
    defineField({
      name: "openGraphImage",
      title: "Open Graph image",
      type: "image",
      group: "seo",
      description:
        "Image used when the article is shared on social media. Leave empty to use the featured image.",
      options: { hotspot: true },
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
      subtitle: "excerpt",
      media: "featuredImage",
      status: "status",
    },
    prepare(selection) {
      const { title, subtitle, media, status } = selection;
      const label = status === "published" ? "" : `[${status}] `;
      return {
        title: title || "Untitled post",
        subtitle: subtitle ? `${label}${subtitle}` : label.trim() || "No excerpt",
        media,
      };
    },
  },
});