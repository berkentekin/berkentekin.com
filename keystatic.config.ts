
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
      },
    }),
  },
});
