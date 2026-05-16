import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.limani-fliesenleger.de',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/datenschutz') && !page.includes('/impressum'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
