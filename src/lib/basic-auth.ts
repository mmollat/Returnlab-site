import type { NextRequest } from "next/server";

export function hasValidBasicAuth(request: NextRequest) {
  const expectedUsername = process.env.REPORTS_USERNAME;
  const expectedPassword = process.env.REPORTS_PASSWORD;
  const authorization = request.headers.get("authorization");

  if (!expectedUsername || !expectedPassword || !authorization?.startsWith("Basic ")) {
    return false;
  }

  try {
    const credentials = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = credentials.indexOf(":");

    if (separator === -1) return false;

    return (
      credentials.slice(0, separator) === expectedUsername &&
      credentials.slice(separator + 1) === expectedPassword
    );
  } catch {
    return false;
  }
}
