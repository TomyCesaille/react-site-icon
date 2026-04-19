import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://TomyCesaille.github.io',
  base: '/react-site-icon',
  integrations: [react()],
});
