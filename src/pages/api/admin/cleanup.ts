import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

// Basic security: require a key in the query string
// In production, this should be an environment variable.
// For now, hardcoded for simplicity as per plan, but ideally checked against env.
const CLEANUP_KEY = 'berkentekin-admin-cleanup';

export async function GET({ request, locals }: APIContext) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (key !== CLEANUP_KEY) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const db = (locals as any).runtime.env.berkentekin_db;

        // 1. Get all valid UUIDs from content
        const posts = await getCollection('posts');
        const validUUIDs = new Set(posts.map(p => p.data.uuid).filter(Boolean));

        // 2. Get all Likes from DB
        const { results } = await db.prepare("SELECT slug FROM Likes").all();
        const allLikedIDs = results.map((r: any) => r.slug);

        // 3. Find orphans
        const orphans = allLikedIDs.filter((id: string) => !validUUIDs.has(id));

        if (orphans.length === 0) {
            return new Response(JSON.stringify({ message: "No orphans found", deleted: 0 }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 4. Delete orphans
        // D1 doesn't support 'WHERE slug IN (...)', so we loop or use ORs.
        // Looping is safer for small batches.
        const stmt = db.prepare("DELETE FROM Likes WHERE slug = ?");
        const batch = orphans.map((id: string) => stmt.bind(id));
        await db.batch(batch);

        return new Response(JSON.stringify({
            message: "Cleanup complete",
            deleted: orphans.length,
            orphans
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
