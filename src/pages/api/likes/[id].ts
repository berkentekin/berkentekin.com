import type { APIContext } from 'astro';

export const prerender = false;

export async function GET({ params, request, locals }: APIContext) {
    const { id } = params;
    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    try {
        const db = (locals as any).runtime.env.berkentekin_db;
        const { results } = await db.prepare("SELECT count FROM Likes WHERE slug = ?").bind(id).all();
        const count = results.length > 0 ? results[0].count : 0;

        return new Response(JSON.stringify({ count }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}

export async function POST({ params, request, locals }: APIContext) {
    const { id } = params;
    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    try {
        const db = (locals as any).runtime.env.berkentekin_db;
        const body = await request.json() as { action?: 'like' | 'unlike' };
        const action = body.action || 'like';

        if (action === 'unlike') {
            // Decrement count, ensuring it doesn't go below 0
            await db.prepare(
                "UPDATE Likes SET count = MAX(0, count - 1) WHERE slug = ?"
            ).bind(id).run();
        } else {
            // Increment count (Upsert)
            await db.prepare(
                "INSERT INTO Likes (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1"
            ).bind(id).run();
        }

        const { results } = await db.prepare("SELECT count FROM Likes WHERE slug = ?").bind(id).all();
        const count = results.length > 0 ? results[0].count : 0;

        return new Response(JSON.stringify({ count }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
