import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the actual prepaint bootstrap, including its real change listeners.
const bootstrap = readFileSync(new URL('../src/scripts/layout-capabilities.js', import.meta.url), 'utf8');
for (const layout of ['BaseLayout','DSLayout']) {
  const source=readFileSync(new URL('../src/layouts/'+layout+'.astro',import.meta.url),'utf8');
  assert(source.includes("import layoutCapabilitiesSource from '../scripts/layout-capabilities.js?raw';"));
  assert(source.includes('<script is:inline set:html={layoutCapabilitiesSource} />'));
  assert(!source.includes('updateWorkLayout'), 'There is only one shared layout condition');
}
assert.ok(bootstrap);
function fixture(width, touch = 0, hover = true, reduced = false, pathname = '/') {
  const window = new EventTarget(), queries = new Map();
  const location = { pathname };
  const root = { dataset: {}, classList: { contains: () => true }, hasAttribute: name=>name==='data-catalog'&&pathname==='/design-system/' };
  const matchMedia = query => {
    const media = new EventTarget();
    media.matches = query.includes('min-width') ? width >= 1024
      : query.includes('reduced-motion') ? reduced : hover;
    queries.set(query, media);
    return media;
  };
  vm.runInNewContext(bootstrap, {
    document: { documentElement: root, querySelector: () => ({}) },
    navigator: { maxTouchPoints: touch }, location, matchMedia, Event, AbortController,
    addEventListener: window.addEventListener.bind(window),
    dispatchEvent: window.dispatchEvent.bind(window), requestAnimationFrame: callback => callback(),
  });
  return { root, window, location, change(query, matches) {
    const media = [...queries].find(([name]) => name.includes(query))[1];
    media.matches = matches; media.dispatchEvent(new Event('change'));
  } };
}
for (const pathname of ['/', '/design-system/']) for (const width of [320, 768, 975, 1023, 1024, 1280, 1920]) {
  for (const touch of [0, 1, 5]) {
    const f = fixture(width, touch, true, false, pathname);
    assert.equal(f.root.dataset.workStageLayout, width >= 1024 && touch === 0 ? 'true' : undefined);
    assert.equal(f.root.dataset.workStageMotion, pathname==='/'?f.root.dataset.workStageLayout:undefined);
    assert.equal(f.root.dataset.workPreviewLayout, pathname==='/'?'true':undefined, 'Existing home and catalog preview coordinates remain unchanged');
  }
}
assert.equal(fixture(1440, 0, false).root.dataset.workStageLayout, undefined);
const f = fixture(1280);
let changes = 0; f.window.addEventListener('workstagelayoutchange', () => changes++);
f.change('min-width', false);
assert.equal(f.root.dataset.workStageLayout, undefined);
assert.equal(f.root.dataset.workStageMotion, undefined);
assert.equal(f.root.dataset.workPreviewLayout, 'true', 'Width changes preserve existing copy coordinates');
f.change('min-width', true);
assert.equal(f.root.dataset.workStageLayout, 'true');
f.change('reduced-motion', true);
assert.equal(f.root.dataset.workStageLayout, 'true', 'Motion preference does not hide the floating filter');
assert.equal(f.root.dataset.workStageMotion, undefined);
f.change('reduced-motion', false);
assert.equal(f.root.dataset.workStageMotion, 'true');
f.change('hover', false);
assert.equal(f.root.dataset.workStageLayout, undefined);
assert.equal(f.root.dataset.workPreviewLayout, 'true', 'Switching input keeps the home heading aligned with its visible background');
assert.equal(changes, 5);
f.window.dispatchEvent(new Event('pagehide'));
f.change('hover', true);
assert.equal(changes, 5, 'Discarded documents remove capability listeners');
assert.equal(fixture(390, 5, false, false, '/design-system/').root.dataset.workPreviewLayout, undefined, 'Touch catalog specimens retain their existing context');
assert.equal(fixture(1280, 0, true, false, '/design-system/').root.dataset.workPreviewLayout, undefined, 'The catalog consumes only the layout decision; home preview coordinates must not clip its live specimens');
const popup = fixture(834, 5, false);
popup.location.pathname = '/case-studies/hooko/';
popup.change('min-width', true);
assert.equal(popup.root.dataset.workPreviewLayout, 'true', 'Popup history changes and orientation/resize retain the home document coordinates');
console.log('PASS: prepaint width/input agreement, live resize, reduced motion and listener cleanup.');
