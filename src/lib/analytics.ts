/// <reference types="@cloudflare/workers-types" />
export interface AnalyticsOptions {
    path?: string;
    action?: string;
    referer?: string; // Override referer (e.g. "API")
}

export function trackEvent(
    request: Request,
    analyticsBinding: AnalyticsEngineDataset | undefined,
    options: AnalyticsOptions = {}
) {
    if (!analyticsBinding) return;

    try {
        const url = new URL(request.url);
        const cf = (request as any).cf;

        // Extract data
        const path = options.path || url.pathname;
        const country = cf?.country || "XX";
        const city = cf?.city || "Unknown";

        // Sanitize User Agent
        const rawUA = request.headers.get("user-agent") || "";
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(rawUA);
        const userAgent = isMobile ? "Mobile" : "Desktop";

        // Sanitize Referer
        let referer = options.referer || "";
        if (!referer) {
            const rawReferer = request.headers.get("referer");
            if (rawReferer) {
                try {
                    const refUrl = new URL(rawReferer);
                    referer = `${refUrl.origin}${refUrl.pathname}`;
                } catch {
                    // Ignore invalid referers
                }
            }
        }

        // Action is optional, defaults to empty or can be null if not used in query
        const action = options.action || "";

        analyticsBinding.writeDataPoint({
            blobs: [
                path,       // Blob 1: Path
                country,    // Blob 2: Country
                city,       // Blob 3: City
                userAgent,  // Blob 4: UA
                referer,    // Blob 5: Referer
                action      // Blob 6: Action (e.g. 'like', 'unlike')
            ],
            doubles: [1],
            indexes: [path]
        });

    } catch (e) {
        console.error("Analytics error:", e);
    }
}
