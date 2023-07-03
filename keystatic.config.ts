
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'berkentekin/berkentekin.com',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date', description: 'The date the post was written' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/posts',
          publicPath: '/images/posts/',
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
        category: fields.select({
          label: 'Category',
          description: 'The section this post belongs to',
          options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Professional', value: 'professional' },
            { label: 'Essay', value: 'essay' },
            { label: 'Story', value: 'story' },
          ],
          defaultValue: 'personal',
        }),
        uuid: fields.text({
          label: 'UUID (System Managed)',
          description: 'Unique ID for like tracking. Do not edit this manually.',
          defaultValue: () => crypto.randomUUID(),
          validation: {
            length: { min: 36, max: 36 },
            pattern: {
              regex: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
              message: 'Must be a valid UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)'
            }
          },
        }),
      },
    }),
  },
});
