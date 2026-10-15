import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../dist/case-studies/index-law-firm/index.html').replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/g, '');
const content = html.match(/<article\b[^>]*data-case-content[^>]*>([\s\S]*?)<\/article>/)?.[1];
assert.ok(content, 'The full case uses the shared article composition');
const text = content.replace(/<[^>]*>/g, ' ').replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex ?? dec, hex ? 16 : 10))).replace(/&(amp|quot|apos|nbsp|lt|gt);/g, (_, entity) => ({ amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>' }[entity])).replace(/\s+/g, ' ').toLowerCase();
for (const copy of JSON.parse(read('./fixtures/index-law-firm-reference.json'))) assert.ok(text.includes(copy.toLowerCase()), 'Preserves source copy: ' + copy);
assert.ok(text.includes('a popover shows what the firm does in that area.') && !text.includes('a click opens a card'), 'The approved introduction describes hover popovers');
assert.deepEqual([...content.matchAll(/<section\b[^>]*aria-labelledby="(index-[^"]+)"/g)].map(match => match[1]), ['index-title', 'index-task', 'index-home', 'index-services', 'index-responsive', 'index-style']);
assert.deepEqual([...content.matchAll(/<section\b[^>]*class="case-study-chapter--inverse"[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1]), ['index-services', 'index-style']);
assert.equal([...content.matchAll(/<case-study-sticky\b/g)].length, 1, 'Main-page copy retains shared sticky behavior');
assert.equal([...content.matchAll(/data-service-tile=/g)].length, 8);
assert.equal([...content.matchAll(/role="tooltip"/g)].length, 8);
assert.deepEqual([...content.matchAll(/data-service-(?:tile|decoration)="([^"]+)"/g)].map(match => match[1]), ['consult', 'clients', 'tie', 'draft', 'court', 'scales', 'staff', 'aid', 'arguments', 'state', 'business', 'skovoroda', 'money', 'copyright', 'kant', 'blank'], 'Mobile flow preserves the original interleaved mosaic order');
assert.ok(!/<button\b[^>]*data-service-tile/.test(content), 'The eight service tiles are informational, without click actions');
for (const marker of ['Task', 'Design', 'Responsive']) assert.ok(content.includes('<span>' + marker + '</span>'), 'Original vertical marker: ' + marker);
assert.ok(content.includes('class="case-study-guides" aria-hidden="true"'), 'The original vertical guide treatment remains decorative');
assert.equal([...content.matchAll(/data-case-video/g)].length, 3);
assert.ok(!content.includes('data-video-controls') && !/<video\b[^>]*\scontrols(?:\s|=|>)/.test(content), 'Index has no native or custom playback toolbar; controlslist is only the shared browser policy');
assert.ok(!/<a\b/.test(content), 'No project links are invented');
for (const [, src] of content.matchAll(/(?:src|data-src|data-svg-src)="(\/projects\/index-law-firm-case-study\/[^"]+)"/g)) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Original local asset exists: ' + src);

// Check viewport clipping independently of the source mosaic and supplied copy.
class EventTargetMock {
  listeners = new Map();
  addEventListener(name, callback, options = {}) {
    const handlers = this.listeners.get(name) ?? new Set();
    handlers.add(callback); this.listeners.set(name, handlers);
    options.signal?.addEventListener('abort', () => handlers.delete(callback), { once: true });
  }
  emit(name, event = {}) { [...(this.listeners.get(name) ?? [])].forEach(callback => callback(event)); }
  get listenerCount() { return [...this.listeners.values()].reduce((count, handlers) => count + handlers.size, 0); }
}
class TileMock extends EventTargetMock {
  constructor(id) {
    super(); this.dataset = { serviceTile: id }; this.hidden = true;
    this.hovered = this.focusVisible = false;
    const classes = new Set();
    this.classList = { add: name => classes.add(name), remove: name => classes.delete(name) };
    this.style = { setProperty() {} }; this.offsetWidth = 360; this.offsetHeight = 270;
  }
  matches(selector) { return selector === ':hover' ? this.hovered : this.focusVisible; }
  getBoundingClientRect() { return { left: 120, right: 420, top: 300, bottom: 600, width: 300 }; }
}
class HostMock {
  tiles = ['consult', 'court'].map(id => new TileMock(id));
  popovers = ['consult', 'court'].map(id => new TileMock(id));
  querySelectorAll(selector) { return selector === '[data-service-tile]' ? this.tiles : this.popovers; }
  querySelector(selector) { return this.popovers.find(pop => selector.includes('"' + pop.dataset.serviceTile + '"')); }
  getBoundingClientRect() { return { left: 64, right: 1216, top: 200, bottom: 1640, width: 1152 }; }
}
const mockedNames = ['HTMLElement', 'customElements', 'matchMedia', 'window', 'document', 'innerWidth', 'innerHeight', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'getComputedStyle'];
const originals = mockedNames.map(name => [name, Object.hasOwn(globalThis, name), globalThis[name]]);
let ServiceTiles;
globalThis.HTMLElement = HostMock;
globalThis.customElements = { get() {}, define(name, constructor) { assert.equal(name, 'case-study-service-tiles'); ServiceTiles = constructor; } };
const { servicePopoverPosition } = await import('../src/scripts/case-study/case-study-service-tiles.ts');
const grid = { left: 64, right: 1216, top: 200, bottom: 1640, width: 1152 };
const bottomTile = { left: 928, right: 1216, top: 450, bottom: 738, width: 288 };
const above = servicePopoverPosition(bottomTile, grid, { width: 360, height: 350 }, { width: 1280, height: 720 });
assert.equal(above.side, 'above', 'A low tile opens its full detail above instead of clipping');
assert.ok(above.left + grid.left >= 16 && above.left + grid.left + 360 <= 1264);
assert.ok(above.top + grid.top >= 16 && above.top + grid.top + 350 <= 704);
const narrow = servicePopoverPosition({ left: 24, right: 160, top: 200, bottom: 350, width: 136 }, { left: 24, right: 296, top: 200, bottom: 1500, width: 272 }, { width: 256, height: 320 }, { width: 320, height: 700 });
assert.ok(narrow.left + 24 >= 16 && narrow.left + 24 + 256 <= 304, 'Keyboard popovers fit a 320px viewport');
const belowControl = servicePopoverPosition(bottomTile, grid, { width: 360, height: 500 }, { width: 1280, height: 720, topInset: 76 });
assert.ok(belowControl.top + grid.top >= 76, 'Long details remain clear of the shared fixed close control');

// Exercise the actual component: mixed mouse/keyboard ownership, hoverable
// details and repeated modal removal must not lose the active popover or leak.
globalThis.getComputedStyle=()=>({getPropertyValue:name=>name==='--delay-service-tooltip'?'160ms':''});
const timers = new Map(), frames = new Map(); let job = 0, observers = 0;
globalThis.matchMedia = () => ({ matches: true });
globalThis.window = new EventTargetMock();
globalThis.document = Object.assign(new EventTargetMock(), { hidden: false, querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 60 }) }) });
globalThis.innerWidth = 1280; globalThis.innerHeight = 720;
globalThis.ResizeObserver = class { observe() { observers++; } disconnect() { observers--; } };
globalThis.requestAnimationFrame = callback => { frames.set(++job, callback); return job; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.setTimeout = (callback,delay) => { assert.equal(delay,160,'Token-based popover delay remains exactly 160ms');timers.set(++job, callback); return job; };
globalThis.clearTimeout = id => timers.delete(id);
try {
  const widget = new ServiceTiles(); widget.connectedCallback();
  const [consult, court] = widget.tiles;
  court.focusVisible = true; court.emit('focusin');
  assert.equal(widget.popovers[1].hidden, false);
  consult.hovered = true; consult.emit('pointerenter', { pointerType: 'mouse' });
  court.focusVisible = false; court.emit('focusout');
  assert.equal(widget.popovers[0].hidden, false, 'An old focused tile cannot hide the newly hovered tile');
  assert.ok(widget.tiles.every(tile => !tile.listeners.has('click')), 'No click action is registered');
  consult.hovered = false; consult.emit('pointerleave');
  assert.equal(timers.size, 1);
  const pop = widget.popovers[0]; pop.hovered = true; pop.emit('pointerenter');
  assert.equal(timers.size, 0, 'The user can move onto and read the floating details');
  pop.hovered = false; pop.emit('pointerleave');
  const waiting = [...timers.values()]; timers.clear(); waiting.forEach(callback => callback());
  assert.ok(widget.popovers.every(pop => pop.hidden), 'Leaving dismisses the popover');
  consult.focusVisible = true; consult.emit('focusin');
  let stopped = false, prevented = false;
  consult.emit('keydown', { key: 'Escape', preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } });
  assert.ok(prevented && stopped && widget.popovers.every(pop => pop.hidden), 'Escape dismisses details and cancels the browser dialog-close action');
  for (let cycle = 0; cycle < 5; cycle++) {
    consult.emit('focusin');
    window.emit('scroll'); window.emit('scroll');
    assert.equal(frames.size, 1, 'Scroll repositioning shares one pending frame');
    widget.disconnectedCallback();
    assert.equal(frames.size + timers.size + observers + window.listenerCount + document.listenerCount + widget.tiles.reduce((sum, tile) => sum + tile.listenerCount, 0) + widget.popovers.reduce((sum, pop) => sum + pop.listenerCount, 0), 0, 'Closing cleans up every listener, observer, timer and frame');
    if (cycle < 4) widget.connectedCallback();
  }
} finally {
  for (const [name, present, value] of originals) { if (present) globalThis[name] = value; else delete globalThis[name]; }
}
console.log('PASS: Index source copy, original media, dark bands, guide captions, sticky composition, hover-only tiles and viewport-safe popovers.');
