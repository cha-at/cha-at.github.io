// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://cha-at.github.io',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
