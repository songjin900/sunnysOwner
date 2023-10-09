import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
  userAgent,
} from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { isBot } = userAgent(req);
  if (isBot) {
    console.log("hello Bot Please get out");
  }

  // if (
  //   !req.cookies.has("sunnyssession") &&
  //   !req.nextUrl.pathname.startsWith("/api") &&
  //   req.url.includes("/order")
  // ) {
  //   req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
  //   req.nextUrl.pathname = "/shop";
  //   return NextResponse.redirect(req.nextUrl);
  // }
}
