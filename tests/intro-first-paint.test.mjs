import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
const bootstrap = layout.match(/\{homeIntro && <script is:inline>([\s\S]*?)<\/script>\}/)[1];
function boot({ reduced = false, animate = true } = {}) {
  const root = { dataset: {}, classList: { contains: () => false } };
  const events = new Map();
  vm.runInNewContext(bootstrap, {
    document: { documentElement: root },
    Element: { prototype: { animate: animate ? () => {} : undefined } },
    matchMedia: () => ({ matches: reduced }),
    addEventListener: (event, callback) => events.set(event, callback),
  });
  return { root, events };
}
const normal = boot();
assert.equal(normal.root.dataset.homeIntro, 'pending', 'Gate exists synchronously before body parsing or module loading');
normal.events.get('load')();
assert.equal(normal.root.dataset.homeIntro, undefined, 'Failed module reveals readable fallback at load');
const ready = boot(); ready.root.classList.contains = () => true;
ready.events.get('load')();
assert.equal(ready.root.dataset.homeIntro, 'pending', 'Slow fonts must not expose the complete hero before effects are ready');
assert.equal(boot({ reduced: true }).root.dataset.homeIntro, undefined);
assert.equal(boot({ animate: false }).root.dataset.homeIntro, undefined);
assert.ok(layout.indexOf(bootstrap) < layout.indexOf('<body>'));
assert.match(readFileSync('src/pages/index.astro', 'utf8'), /<BaseLayout resetToTopOnReload homeIntro>/);
assert.ok(!readFileSync('src/components/CaseStudyPage.astro', 'utf8').includes('homeIntro'));
console.log('PASS: synchronous pre-paint gate, delayed-font ownership, module failure, reduced motion and unsupported-animation fallback.');
