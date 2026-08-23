import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy blog URLs used ?category=<slug> filtering. Those moved to clean
 * /blog/category/<slug> URLs - this keeps old links working with a real
 * server-side redirect (no client-side JavaScript involved).
 *
 * Runs before rendering, so the response is a genuine HTTP 307.
 */
export function proxy(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  if (!category) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.search = "";

  if (category !== "all") {
    url.pathname = `/blog/category/${encodeURIComponent(category)}`;
  }

  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: "/blog",
};
