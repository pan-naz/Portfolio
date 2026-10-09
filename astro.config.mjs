import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://naz.wtf',
  devToolbar: { enabled: false },
  integrations: [{
    name: 'separate-vite-caches',
    hooks: {
      // A build/check must not invalidate a running dev server's optimized dependencies.
      'astro:config:setup': ({ command, updateConfig }) => {
        updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
      },
    },
  }],
});
