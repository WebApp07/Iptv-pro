import { defineArrayMember, defineField, defineType } from "sanity";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "organization", title: "Organization" },
    { name: "seo", title: "SEO" },
    { name: "advanced", title: "Advanced" },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    // ------------------------------------------------------------------
    // Content
    // ------------------------------------------------------------------
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "The headline of the article. Shown as the H1 on the page.",
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
      description:
        "The URL path of the article, for example what-is-iptv. Becomes /blog/your-slug.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => [
        rule.required().error("A slug is required"),
        rule.custom((value) => {
          if (!value?.current) return true;
          return SLUG_PATTERN.test(value.current)
            ? true
            : "Use lowercase words separated by hyphens, with no spaces or special characters";
        }),
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      group: "content",
      rows: 3,
      description:
        "A short summary shown on cards and used as the meta description fallback.",
      validation: (rule) => [
        rule.required().error("An excerpt is required"),
        rule.max(160).warning("Keep the excerpt between 140-160 characters for search results"),
        rule.min(50).warning("Short excerpts get truncated in search results. Aim for at least 50 characters"),
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
          description:
            "Describes the image for screen readers and search engines. Mention the topic naturally.",
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
      description:
        "The main article content. Use Heading 2 and Heading 3 for sections - they build the table of contents automatically.",
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
                      "Link to other blog articles or category pages with /blog/... paths to build internal links. Use full URLs only for external sites.",
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
              validation: (rule) => rule.required().error("Alternative text is required"),
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

    // ------------------------------------------------------------------
    // Organization
    // ------------------------------------------------------------------
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "organization",
      description:
        "Primary category first - it is shown on cards and drives related articles.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      validation: (rule) =>
        rule.required().min(1).error("Add at least one category"),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "organization",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Free-form topics, for example firestick, smart-tv or buffering. Used for related content and long-tail discovery.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "organization",
      to: [{ type: "author" }],
      validation: (rule) => rule.required().error("An author is required"),
    }),

    // ------------------------------------------------------------------
    // SEO
    // ------------------------------------------------------------------
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      description: "Shown in search results. Leave empty to use the article title.",
      validation: (rule) => [
        rule.max(60).warning("Aim for 50-60 characters so the title is not truncated"),
        rule.min(30).warning("Very short titles waste search result space. Aim for 30+ characters"),
      ],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      group: "seo",
      rows: 3,
      description: "Shown in search results. Leave empty to use the excerpt.",
      validation: (rule) =>
        rule.max(160).warning("Aim for 140-160 characters so the description is not truncated"),
    }),
    defineField({
      name: "focusKeyword",
      title: "Focus keyword",
      type: "string",
      group: "seo",
      description:
        "The main search phrase this article targets, for example what is iptv. Ideally appears in the title, slug and first paragraph.",
    }),
    defineField({
      name: "secondaryKeywords",
      title: "Secondary keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Long-tail variations that support the focus keyword.",
    }),
    defineField({
      name: "seoKeywords",
      title: "Legacy keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Kept for older articles. Prefer focus/secondary keywords above.",
      hidden: ({ document }) => Boolean(document?.focusKeyword),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      group: "seo",
      description:
        "Only needed when this article is syndicated from another source. Leave empty to use the article's own URL.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      group: "seo",
      initialValue: false,
      description:
        "Adds noindex to the page. Use sparingly - published posts are normally indexed.",
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

    // ------------------------------------------------------------------
    // Advanced
    // ------------------------------------------------------------------
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "advanced",
      description:
        "Questions shown in a section at the end of the article. Great for capturing People Also Ask results.",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          title: "Question",
          fields: [
            defineField({
              name: "question",
              type: "string",
              title: "Question",
              validation: (rule) => rule.required().error("A question is required"),
            }),
            defineField({
              name: "answer",
              type: "text",
              title: "Answer",
              rows: 4,
              description: "One clear paragraph. Search engines show this directly in results.",
              validation: (rule) => [
                rule.required().error("An answer is required"),
                rule.max(500).warning("Keep answers focused - around 300 characters works best"),
              ],
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        }),
      ],
      validation: (rule) => rule.max(10).warning("More than 8 questions rarely helps readers"),
    }),
    defineField({
      name: "relatedPosts",
      title: "Related posts",
      type: "array",
      group: "advanced",
      of: [defineArrayMember({ type: "reference", to: [{ type: "post" }] })],
      description:
        "Hand-picked articles to link to. Leave empty to let the site pick related posts from categories and tags automatically.",
    }),
    defineField({
      name: "readingTime",
      title: "Estimated reading time",
      type: "number",
      group: "advanced",
      description: "In minutes. Leave empty to auto-calculate from the body.",
      validation: (rule) =>
        rule.integer().min(1).max(60).error("Enter a whole number of minutes"),
    }),

    // ------------------------------------------------------------------
    // Publishing
    // ------------------------------------------------------------------
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
      description:
        "When the article was last revised. Refresh this when you make meaningful updates - it feeds the dateModified structured data.",
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
