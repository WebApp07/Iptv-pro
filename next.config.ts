import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      // Team crest images returned by the sports provider (API-Sports).
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/football/**" },
    ],
  },
};

export default nextConfig;