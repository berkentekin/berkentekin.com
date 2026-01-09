// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';

import markdoc from '@astrojs/markdoc';

const isBuild = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  prefetch: {
    defaultStrategy: 'viewport',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: isBuild ? {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      }
    } : undefined,
    ssr: isBuild ? {
      noExternal: ['react', 'react-dom'],
    } : undefined
  },

  integrations: [react(), keystatic(), markdoc()],

  adapter: cloudflare({
    imageService: 'compile',
  })
});