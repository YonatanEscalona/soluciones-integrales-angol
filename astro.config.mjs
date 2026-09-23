import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://YonatanEscalona.github.io',
  base: '/soluciones-integrales-angol',
  vite: {
    plugins: [tailwindcss()],
  },
});
