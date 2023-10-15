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
  //   !req.cookies.has("sunnysadminsession") &&
  //   !req.nextUrl.pathname.startsWith("/api") &&
  //   req.url.includes("/owner")
  // ) {
  //   req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
  //   req.nextUrl.pathname = "/shop";
  //   return NextResponse.redirect(req.nextUrl);
  // }
}
