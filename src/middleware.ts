import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const virtualRunHosts = (process.env.NEXT_PUBLIC_VIRTUAL_RUN_HOST ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

function isVirtualRunHost(request: NextRequest): boolean {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  return virtualRunHosts.length > 0 && virtualRunHosts.includes(host);
}

export function middleware(request: NextRequest) {
  if (!isVirtualRunHost(request)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/virtual-run") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/virtual-run" : `/virtual-run${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)"],
};
