import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const response = await next();

    // Only track successful GET requests to pages
    if (context.request.method !== "GET" || response.status !== 200) {
        return response;
    }

    const url = new URL(context.request.url);

    // Filter out static assets and internal paths
    if (
        url.pathname.startsWith("/_image") ||
        url.pathname.startsWith("/favicon") ||
        url.pathname.startsWith("/api") || // Exclude API calls
        url.pathname.startsWith("/keystatic") || // Exclude Admin UI
        url.pathname.match(/\.(css|js|jpg|png|gif|ico|svg|woff2?)$/)
    ) {
        return response;
    }

    // Ignore prefetch requests
    const purpose = context.request.headers.get("Purpose");
    const secPurpose = context.request.headers.get("Sec-Purpose");
    if (purpose === "prefetch" || secPurpose === "prefetch" || secPurpose === "prerender") {
        return response;
    }

    try {
        // Access the analytics binding from the Cloudflare environment
        const analytics = context.locals.runtime?.env?.berkentekin_analytics;

        if (analytics) {
            const cf = (context.request as any).cf;

            // Basic data points
            const path = url.pathname;
            const country = cf?.country || "XX";
            const city = cf?.city || "Unknown";
            const rawUA = context.request.headers.get("user-agent") || "";
            const isMobile = /Mobile|Android|iPhone|iPad/i.test(rawUA);
            const userAgent = isMobile ? "Mobile" : "Desktop"; // Simplified for privacy

            const rawReferer = context.request.headers.get("referer");
            let referer = "";
            if (rawReferer) {
                try {
                    const refUrl = new URL(rawReferer);
                    referer = `${refUrl.origin}${refUrl.pathname}`; // Remove query params
                } catch {
                    // Ignore invalid referers
                }
            }

            analytics.writeDataPoint({
                blobs: [
                    path, // Blob 1: URL Path
                    country, // Blob 2: Country
                    city, // Blob 3: City
                    userAgent, // Blob 4: User Agent
                    referer // Blob 5: Referer
                ],
                doubles: [
                    1, // Double 1: Count (always 1 for a view)
                ],
                indexes: [
                    path, // Index on Path for fast filtering
                ],
            });
        }
    } catch (e) {
        // Analytics should never break the app
        console.error("Analytics error:", e);
    }

    return response;
});
