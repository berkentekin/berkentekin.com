/// <reference path="../.astro/types.d.ts" />

interface Env {
    berkentekin_analytics: AnalyticsEngineDataset;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime { }
}
