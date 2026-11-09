import { headers } from "next/headers";

// The production domain is not chosen yet, so absolute URLs follow the request host.
export async function siteOrigin() {
  // Set SITE_URL once the domain is chosen: canonical URLs then stop depending on the request.
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0];
  const rawHost = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const host = /^[a-z0-9.:-]+$/i.test(rawHost) ? rawHost : "localhost:3000";
  const rawProtocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0] ??
    (host.startsWith("localhost") ? "http" : "https");
  const protocol = rawProtocol === "http" ? "http" : "https";
  return `${protocol}://${host}`;
}
