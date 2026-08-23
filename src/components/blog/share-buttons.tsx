import { siteUrl } from "@/config/site";

export function ShareButtons({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const url = encodeURIComponent(siteUrl(`/blog/${slug}`));
  const text = encodeURIComponent(title);

  const links = [
    {
      name: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
      ),
    },
    {
      name: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      icon: (
        <path d="M13.5 21v-8.25h2.77l.41-3.22H13.5V7.47c0-.93.26-1.57 1.6-1.57h1.7V3.02c-.3-.04-1.31-.13-2.49-.13-2.46 0-4.15 1.5-4.15 4.27v2.37H7.38v3.22h2.78V21h3.34Z" />
      ),
    },
    {
      name: "Share on WhatsApp",
      href: `https://wa.me/?text=${text}%20${url}`,
      icon: (
        <path d="M12.04 2a9.9 9.9 0 0 0-8.51 14.94L2 22l5.19-1.5A9.93 9.93 0 0 0 12.04 22C17.53 22 22 17.53 22 12.05 22 6.47 17.53 2 12.04 2Zm0 18.15c-1.74 0-3.36-.52-4.72-1.42l-.34-.2-3.08.89.9-3-.22-.35a8.06 8.06 0 0 1-1.24-4.31c0-4.54 3.7-8.23 8.24-8.23 4.55 0 8.24 3.69 8.24 8.24 0 4.54-3.69 8.38-8.28 8.38Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
      ),
    },
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
      <span className="text-sm font-medium text-muted">Share this article</span>
      <div className="flex items-center gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            title={link.name}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-[#ffd166]/40 hover:text-[#ffd166]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              {link.icon}
            </svg>
          </a>
        ))}
      </div>
      <span className="sr-only">Share links</span>
    </div>
  );
}
