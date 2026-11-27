import { NextRequest, NextResponse } from "next/server";
import { hasValidBasicAuth } from "./lib/basic-auth";

export function proxy(req: NextRequest) {
  if (hasValidBasicAuth(req)) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ReturnLab Staff"',
      "Cache-Control": "private, no-store",
    },
  });
}

export const config = { matcher: ["/reports/:path*", "/intake/:path*"] };
