import { defineMiddleware } from "astro:middleware";
import { trackEvent } from "./lib/analytics";

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
            trackEvent(context.request, analytics);
        }
    } catch (e) {
        // Analytics should never break the app
        console.error("Analytics error:", e);
    }

    return response;
});
