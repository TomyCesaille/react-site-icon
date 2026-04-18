import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jorislacance.github.io',
  base: '/react-site-icon',
  integrations: [react()],
});
