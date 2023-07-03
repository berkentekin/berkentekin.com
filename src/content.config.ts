
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.coerce.date().optional(),
        coverImage: z.string().optional(),
        category: z.enum(['personal', 'professional', 'essay', 'story']).default('personal'),
        uuid: z.string(),
        // content is handled by markdoc automatically
    }),
});

export const collections = { posts };
