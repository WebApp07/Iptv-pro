import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy URL cleanups, handled before rendering so responses are genuine
 * HTTP 307s (no client-side JavaScript involved).
 *
 * - /blog?category=<slug>   -> /blog/category/<slug>
 * - /sports?sport=<slug>    -> /sports/<slug>
 */
const SPORT_SLUGS = new Set([
  "all",
  "football",
  "basketball",
  "tennis",
  "hockey",
  "baseball",
  "mma",
]);

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/blog") {
    const category = searchParams.get("category");
    if (!category) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.search = "";
    if (category !== "all") {
      url.pathname = `/blog/category/${encodeURIComponent(category)}`;
    }
    return NextResponse.redirect(url, 307);
  }

  if (pathname === "/sports") {
    const sport = searchParams.get("sport");
    if (!sport) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.search = "";
    if (!SPORT_SLUGS.has(sport)) {
      // Unknown sport values fall back to the clean hub instead of a
      // redirect to a 404.
      return NextResponse.redirect(url, 307);
    }
    if (sport !== "all") {
      url.pathname = `/sports/${sport}`;
    }
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog", "/sports"],
};
