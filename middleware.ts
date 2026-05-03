import { NextRequest, NextResponse } from "next/server";

const USERNAME = process.env.REPORTS_USERNAME;
const PASSWORD = process.env.REPORTS_PASSWORD;

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pass] = atob(authValue).split(":");

    if (user === USERNAME && pass === PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ReturnLab Reports"',
    },
  });
}

export const config = {
  matcher: ["/reports/:path*"],
};
