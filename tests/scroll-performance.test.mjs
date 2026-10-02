import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Run the actual scroll controller with browser/Lenis doubles. Precise-pointer
// Safari must match Chrome; touch keeps native scrolling without pull-to-refresh.
const frames = new Set(), listeners = new Map(), documentListeners = new Map();
let setup, cleanup, created = [], lagSmoothing;
const gsap = {
  registerPlugin() {},
  matchMedia: () => {
    let dispose;
    return {
      add(query, callback) {
        setup = () => { dispose = callback(); return dispose; };
        assert.match(query, /min-width: 768px/);
        assert.match(query, /pointer: fine/);
        assert.match(query, /prefers-reduced-motion: no-preference/);
      },
      revert() { dispose?.(); dispose = undefined; },
    };
  },
  ticker: { add: fn => frames.add(fn), remove: fn => frames.delete(fn), lagSmoothing: value => { lagSmoothing = value; } },
};
class Lenis {
  constructor(options) { this.options = options; created.push(this); }
  get actualScroll() { return this.options.wrapper === window ? window.scrollY : this.options.wrapper.scrollTop; }
  on() {} raf(time) { this.time = time; } stop() { this.stopped = true; }
  start() { this.stopped = false; } destroy() { this.destroyed = true; }
  scrollTo(...args) { this.travel = args; }
}
const ScrollTrigger = { update() {}, refresh() {} };
globalThis.scrollMocks = { gsap, Lenis, ScrollTrigger };
let reduced = false, scrolled;
globalThis.window = {
  scrollY: 400,
  matchMedia: () => ({ matches: reduced }),
  scrollTo: value => { scrolled = value; },
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: name => listeners.delete(name),
};
globalThis.Element = class {};
globalThis.document = {
  documentElement: { dataset: {} }, fonts: { ready: Promise.resolve() }, querySelector: () => null,
  addEventListener: (name, fn) => documentListeners.set(name, fn),
};
let source = readFileSync('src/scripts/motion.ts', 'utf8').replace(/^import .*;\n/gm, '');
source = 'const {gsap, Lenis, ScrollTrigger} = globalThis.scrollMocks;\n' + source;
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeMotion, initializeSmoothScroll, scrollToSection, repositionWork, pauseScroll, resumeScroll } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' } });
initializeMotion(); // The media query does not invoke setup on touch devices.
assert.equal(created.length, 0);
assert.equal(frames.size, 0);
const targetElement = new Element();
targetElement.closest = () => null;
documentListeners.get('touchstart')({ touches: [{ clientX: 100, clientY: 100 }] });
const touchMove = (x, y, scrollY = 0, target = targetElement) => {
  window.scrollY = scrollY;
  let prevented = false;
  documentListeners.get('touchmove')({ cancelable: true, touches: [{ clientX: x, clientY: y }], target, preventDefault() { prevented = true; } });
  return prevented;
};
assert.equal(touchMove(100, 130), true, 'downward pull at the top is canceled');
assert.equal(touchMove(100, 70), false, 'upward scrolling remains native');
assert.equal(touchMove(140, 120), false, 'horizontal gestures remain native');
assert.equal(touchMove(100, 130, 1), false, 'downward scrolling above the top remains native');
const nested = new Element(); nested.closest = () => nested;
assert.equal(touchMove(100, 130, 0, nested), false, 'nested scroll containers retain their gestures');
documentListeners.get('touchstart')({ touches: [{ clientX: 100, clientY: 100 }, { clientX: 120, clientY: 120 }] });
assert.equal(touchMove(100, 130), false, 'a multi-touch gesture never inherits an earlier touch origin');
let focused, travelled;
const target = { id: 'work', focus: value => { focused = value; }, scrollIntoView: value => { travelled = value; } };
scrollToSection(target);
assert.deepEqual(focused, { preventScroll: true });
assert.deepEqual(travelled, { behavior: 'smooth', block: 'start' });
reduced = true; scrollToSection(target);
assert.equal(travelled.behavior, 'instant'); reduced = false;
scrollToSection({ ...target, id: 'top' });
assert.deepEqual(scrolled, { top: 0, behavior: 'smooth' });
repositionWork(-50); assert.deepEqual(scrolled, { top: 0, behavior: 'instant' });
pauseScroll(); resumeScroll();
window.scrollY = 400;
for (const agent of [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.0 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/130.0',
]) {
  navigator.userAgent = agent;
  initializeMotion(); cleanup = setup();
  const lenis = created.at(-1);
  assert.equal(frames.size, 1);
  assert.equal(lagSmoothing, 0, 'GSAP must not distort the scroll clock after a delayed frame');
  [...frames][0](2); assert.equal(lenis.time, 2000);
  pauseScroll(); assert.equal(lenis.stopped, true);
  resumeScroll(); assert.equal(lenis.stopped, false);
  scrollToSection(target); assert.equal(lenis.travel[0], target);
  listeners.get('keydown')({ key: 'Tab' });
  assert.deepEqual(lenis.travel, [400, { immediate: true }]);
  cleanup(); assert.equal(frames.size, 0); assert.equal(lenis.destroyed, true);
}
console.log('PASS: Safari/Chrome/Firefox wheel smoothing, native touch with top-edge guard, clock sync, anchor focus, filtering and cleanup.');

// Modal scrolling shares the actual homepage controller. Reopening must not
// accumulate tickers or cancel the homepage's independent scroll controller.
const homeScroll = initializeSmoothScroll(); setup();
const homeLenis = created.at(-1);
pauseScroll();
const caseListeners = new Map();
const wrapper = new Element();
wrapper.scrollTop = 180;
wrapper.addEventListener = (name, callback) => caseListeners.set(name, callback);
wrapper.removeEventListener = name => caseListeners.delete(name);
const caseContent = new Element();
document.querySelector = () => ({ open: true });
for (let open = 0; open < 3; open++) {
  const caseScroll = initializeSmoothScroll(wrapper, caseContent); setup();
  const caseLenis = created.at(-1);
  for (const setting of ['lerp', 'smoothWheel', 'syncTouch', 'anchors']) {
    assert.equal(caseLenis.options[setting], homeLenis.options[setting], `Identical ${setting} for case and homepage`);
  }
  assert.equal(caseLenis.options.lerp, .18);
  assert.equal(caseLenis.options.wrapper, wrapper);
  assert.equal(caseLenis.options.content, caseContent);
  assert.equal(homeLenis.stopped, true, 'The homepage remains stopped behind the modal');
  assert.notEqual(caseLenis.stopped, true, 'An open dialog does not stop its own controller');
  wrapper.closest = () => wrapper;
  assert.equal(homeLenis.options.prevent(wrapper), true, 'The homepage ignores input within a case');
  assert.equal(caseLenis.options.prevent(wrapper), false, 'The case receives its own input');
  assert.equal(frames.size, 2);
  for (const tick of frames) tick(2);
  assert.equal(caseLenis.time, homeLenis.time, 'Both use the same frame clock');
  caseListeners.get('keydown')({ key: 'PageDown' });
  assert.deepEqual(caseLenis.travel, [180, { immediate: true }], 'Keyboard input cancels only the case glide');
  caseScroll.destroy();
  assert.equal(caseLenis.destroyed, true);
  assert.equal(caseListeners.size, 0);
  assert.equal(frames.size, 1, 'Closing removes only the case ticker');
}
resumeScroll(); assert.equal(homeLenis.stopped, false);
homeScroll.destroy(); assert.equal(frames.size, 0);
document.querySelector = () => null;
const directScroll = initializeSmoothScroll(); setup();
assert.equal(created.at(-1).options.lerp, .18, 'Standalone pages use the same pace');
directScroll.destroy();
assert.equal(frames.size, 0);
assert.ok(readFileSync('src/components/CaseStudyPage.astro', 'utf8').includes('initializeMotion();'), 'Direct case-study pages load the shared controller');
console.log('PASS: identical case/home pace, modal input isolation, keyboard cancellation, repeated open/close cleanup and standalone scroll setup.');

// The real docking controller should sleep once settled, even during a stream
// of scroll events; direction changes must still complete both transitions.
let writes = 0, clock = 0, sequence = 0;
const jobs = new Map();
globalThis.performance = { now: () => clock };
globalThis.requestAnimationFrame = fn => { jobs.set(++sequence, fn); return sequence; };
globalThis.cancelAnimationFrame = id => jobs.delete(id);
function element(width = 172) {
  return {
    style: new Proxy({ setProperty() { writes++; }, removeProperty() { writes++; } }, { set(obj, key, value) { writes++; obj[key] = value; return true; } }),
    dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
    offsetWidth: width, offsetHeight: 48, inert: false,
    getBoundingClientRect: () => ({ top: 550 - window.scrollY, left: 180 }),
    append(child) { child.parentElement = this; }, contains: () => false,
    focus() {},
  };
}
const identity = element(), full = element(), compact = element(), controls = element(220), theme = element();
const surface = element(), slot = element(), home = element(), button = element(), hero = element();
const header = element(); home.append(button);
const nodes = { '.identity': identity, '.header-full-logo': full, '.header-compact-logo': compact, '.header-controls': controls, '.header-pill-surface': surface };
header.querySelector = selector => nodes[selector]; controls.querySelector = () => theme;
slot.querySelector = selector => selector === '.button' ? button : home; slot.closest = () => hero;
document.querySelector = selector => selector === '.site-header' ? header : selector === '[data-hero-cta]' ? slot : hero;
document.activeElement = null;
window.scrollY = 0; window.innerWidth = 1440;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.getComputedStyle = () => ({ top: '32px', getPropertyValue: () => '900' });
globalThis.ResizeObserver = class { observe() {} };
source = readFileSync('src/scripts/header-morph.ts', 'utf8')
  .replace("'./header-morph-model'", JSON.stringify(new URL('../src/scripts/header-morph-model.ts', import.meta.url).href))
  .replace("'./native-motion'", JSON.stringify(new URL('../src/scripts/native-motion.ts', import.meta.url).href))
  .replaceAll('import.meta.hot', 'undefined');
const headerJs = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeHeaderMorph } = await import(`data:text/javascript;base64,${Buffer.from(headerJs).toString('base64')}`);
initializeHeaderMorph(); await Promise.resolve();
const scroll = y => { window.scrollY = y; listeners.get('scroll')(); };
const settle = () => {
  for (let i = 0; jobs.size && i < 120; i++) {
    clock += 1000 / 60;
    const current = [...jobs.values()]; jobs.clear(); current.forEach(fn => fn(clock));
  }
  assert.equal(jobs.size, 0, 'Header completes without ongoing scrolling');
};
let baseline = writes;
for (let y = 1; y < 500; y++) scroll(y);
assert.equal(jobs.size, 0, 'Scrolling within hero must not wake a settled header');
assert.equal(writes, baseline);
scroll(550); assert.equal(jobs.size, 1); settle();
assert.equal(header.dataset.pillState, 'expanded'); assert.equal(button.parentElement, header);
baseline = writes;
for (let y = 600; y < 2000; y++) scroll(y);
assert.equal(jobs.size, 0, 'Expanded header must not repaint for every scroll event');
assert.equal(writes, baseline);
scroll(540); settle();
assert.equal(header.dataset.pillState, 'hero'); assert.equal(button.parentElement, home);
scroll(600); settle(); assert.equal(header.dataset.pillState, 'expanded', 'Scrolling down restores the pill');
console.log('PASS: settled header sleeps across 1,899 scroll events; docking, return and reversal still complete.');
