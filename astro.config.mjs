import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://yonatanescalona.github.io',
  base: process.env.BASE_PATH ?? '/soluciones-integrales-angol',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
