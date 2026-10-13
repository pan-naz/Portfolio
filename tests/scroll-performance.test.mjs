import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const frames = new Set(), listeners = new Map(), documentListeners = new Map(), queries = [];
let created = [], lagSmoothing, precise = false, reduced = false, scrolled, loads = 0;
const gsap = { ticker: { add: fn => frames.add(fn), remove: fn => frames.delete(fn), lagSmoothing: value => { lagSmoothing = value; } } };
class Lenis {
  constructor(options) { this.options = options; created.push(this); }
  get actualScroll() { return this.options.wrapper === window ? window.scrollY : this.options.wrapper.scrollTop; }
  raf(time) { this.time = time; } stop() { this.stopped = true; }
  start() { this.stopped = false; } destroy() { this.destroyed = true; }
  scrollTo(...args) { this.travel = args; }
}
globalThis.scrollMocks = { gsap, Lenis };
globalThis.window = {
  scrollY: 400,
  matchMedia: query => {
    if (query === '(prefers-reduced-motion: reduce)') return { get matches() { return reduced; } };
    assert.match(query, /min-width: 768px/); assert.match(query, /pointer: fine/); assert.match(query, /prefers-reduced-motion: no-preference/);
    const handlers = new Set();
    const media = { get matches() { return precise && !reduced; }, addEventListener: (_, fn) => handlers.add(fn), removeEventListener: (_, fn) => handlers.delete(fn), emit: () => [...handlers].forEach(fn => fn()), handlers };
    queries.push(media); return media;
  },
  scrollTo: value => { scrolled = value; }, dispatchEvent() {},
  addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name),
};
globalThis.Element = class {};
globalThis.document = { documentElement: { dataset: {} }, fonts: { ready: Promise.resolve() }, querySelector: () => null, addEventListener: (name, fn) => documentListeners.set(name, fn) };
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const url = js => `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
let engineSource = readFileSync('src/scripts/scroll-engine.ts', 'utf8').replace(/^import .*;\n/gm, '');
const { createScrollEngine } = await import(url(compile('const {gsap, Lenis} = globalThis.scrollMocks;\n'+engineSource)));
globalThis.loadScrollEngine = async () => { loads++; return { createScrollEngine }; };
let source = readFileSync('src/scripts/motion.ts', 'utf8').replace(/^import .*;\n/gm, '').replace("import('./scroll-engine')", 'globalThis.loadScrollEngine()');
const { initializeMotion, initializeSmoothScroll, scrollToSection, repositionWork, pauseScroll, resumeScroll } = await import(url(compile(source)));
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'iPad Safari' } });
initializeMotion(); await Promise.resolve();
assert.equal(loads, 0, 'Unused contexts do not request the wheel engine'); assert.equal(created.length, 0); assert.equal(frames.size, 0);
const targetElement = new Element(); targetElement.closest = () => null;
documentListeners.get('touchstart')({ touches: [{ clientX: 100, clientY: 100 }] });
const touchMove = (x, y, scrollY = 0, target = targetElement) => { window.scrollY = scrollY; let prevented = false; documentListeners.get('touchmove')({ cancelable: true, touches: [{ clientX: x, clientY: y }], target, preventDefault() { prevented = true; } }); return prevented; };
assert.equal(touchMove(100, 130), true); assert.equal(touchMove(100, 70), false); assert.equal(touchMove(140, 120), false); assert.equal(touchMove(100, 130, 1), false);
const nested = new Element(); nested.closest = () => nested; assert.equal(touchMove(100, 130, 0, nested), false);
documentListeners.get('touchstart')({ touches: [{ clientX: 100, clientY: 100 }, { clientX: 120, clientY: 120 }] }); assert.equal(touchMove(100, 130), false);
let focused, travelled;
const target = { id: 'work', focus: value => { focused = value; }, scrollIntoView: value => { travelled = value; } };
scrollToSection(target); assert.equal(focused, undefined); assert.deepEqual(travelled, { behavior: 'smooth', block: 'start' });
reduced = true; scrollToSection(target); assert.equal(travelled.behavior, 'instant'); reduced = false;
scrollToSection({ ...target, id: 'top' }); assert.deepEqual(scrolled, { top: 0, behavior: 'smooth' });
repositionWork(-50); assert.deepEqual(scrolled, { top: 0, behavior: 'instant' }); pauseScroll(); resumeScroll(); window.scrollY = 400;
precise = true;
for (const agent of ['Safari', 'Chrome', 'Firefox']) {
 navigator.userAgent = agent; const controller = initializeSmoothScroll(); await controller.ready; const lenis = created.at(-1);
 assert.equal(frames.size, 1); assert.equal(lagSmoothing, 0); [...frames][0](2); assert.equal(lenis.time, 2000, 'Same GSAP seconds-to-milliseconds clock');
 pauseScroll(); assert.equal(lenis.stopped, true); resumeScroll(); assert.equal(lenis.stopped, false);
 scrollToSection(target); assert.equal(lenis.travel[0], target); listeners.get('keydown')({ key: 'Tab' }); assert.deepEqual(lenis.travel, [400, { immediate: true }]);
 controller.destroy(); assert.equal(frames.size, 0); assert.equal(lenis.destroyed, true); assert.equal(queries.at(-1).handlers.size, 0);
}
const homeScroll = initializeSmoothScroll(); await homeScroll.ready; const homeLenis = created.at(-1); pauseScroll();
const caseListeners = new Map(), wrapper = new Element(); wrapper.scrollTop = 180; wrapper.addEventListener = (name, fn) => caseListeners.set(name, fn); wrapper.removeEventListener = name => caseListeners.delete(name); const caseContent = new Element(); document.querySelector = () => ({ open: true });
for (let open = 0; open < 3; open++) {
 const caseScroll = initializeSmoothScroll(wrapper, caseContent); await caseScroll.ready; const caseLenis = created.at(-1);
 for (const setting of ['lerp', 'smoothWheel', 'syncTouch', 'anchors']) assert.equal(caseLenis.options[setting], homeLenis.options[setting]);
 assert.equal(caseLenis.options.lerp, .18); assert.equal(caseLenis.options.wrapper, wrapper); assert.equal(caseLenis.options.content, caseContent); assert.equal(homeLenis.stopped, true); assert.notEqual(caseLenis.stopped, true);
 wrapper.closest = () => wrapper; assert.equal(homeLenis.options.prevent(wrapper), true); assert.equal(caseLenis.options.prevent(wrapper), false);
 assert.equal(frames.size, 2); for (const tick of frames) tick(2); assert.equal(caseLenis.time, homeLenis.time);
 caseListeners.get('keydown')({ key: 'PageDown' }); assert.deepEqual(caseLenis.travel, [180, { immediate: true }]); caseScroll.destroy(); assert.equal(caseLenis.destroyed, true); assert.equal(caseListeners.size, 0); assert.equal(frames.size, 1);
}
resumeScroll(); assert.equal(homeLenis.stopped, false); homeScroll.destroy(); assert.equal(frames.size, 0); document.querySelector = () => null;
const direct = initializeSmoothScroll(); await direct.ready; assert.equal(created.at(-1).options.lerp, .18); direct.destroy();
let release; globalThis.loadScrollEngine = () => new Promise(resolve => { release = resolve; });
const count = created.length, pending = initializeSmoothScroll(); pending.destroy(); release({ createScrollEngine }); await pending.ready; assert.equal(created.length, count, 'Disposal during loading never constructs a late engine');
const changing = initializeSmoothScroll(); reduced = true; queries.at(-1).emit(); release({ createScrollEngine }); await changing.ready; assert.equal(created.length, count, 'Reduced motion during loading cancels initialization'); changing.destroy(); reduced = false;
assert.equal(frames.size, 0); assert.ok(readFileSync('src/components/CaseStudyPage.astro', 'utf8').includes('initializeMotion();'));
console.log('PASS: unchanged wheel options/clock, native touch, input isolation, keyboard cancellation, repeated cleanup, unused-context loading and pending-load cancellation.');

// The real docking controller should sleep once settled, even during a stream
// of scroll events; direction changes must still complete both transitions.
let writes = 0, clock = 0, sequence = 0;
const jobs = new Map();
globalThis.performance = { now: () => clock };
globalThis.requestAnimationFrame = fn => { jobs.set(++sequence, fn); return sequence; };
globalThis.cancelAnimationFrame = id => jobs.delete(id);
function element(width = 172) {
  const classes = new Set();
  return {
    style: new Proxy({ setProperty() { writes++; }, removeProperty() { writes++; } }, { set(obj, key, value) { writes++; obj[key] = value; return true; } }),
    dataset: {}, classList: { add: (...values) => values.forEach(value => classes.add(value)), remove: (...values) => values.forEach(value => classes.delete(value)), contains: value => classes.has(value), toggle(value, force) { const add = force ?? !classes.has(value); if (add) classes.add(value); else classes.delete(value); return add; } },
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
const navigation = element();
header.querySelector = selector => nodes[selector]; controls.querySelector = selector => selector === '.desktop-nav' ? navigation : theme;
full.querySelector = () => ({ width: { baseVal: { value: 79.5 } } });
document.documentElement.dataset.workStageLayout = 'true';
slot.querySelector = selector => selector === '.button' ? button : home; slot.closest = () => hero;
document.querySelector = selector => selector === '.site-header' ? header : selector === '[data-hero-cta]' ? slot : hero;
document.activeElement = null;
window.scrollY = 0; window.innerWidth = 1440;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.document.createElement = () => ({ style: {}, remove() {} });
globalThis.document.documentElement.append = () => {};
globalThis.getComputedStyle = () => ({ paddingTop:'0px',paddingLeft:'0px',paddingRight:'0px',paddingBottom:'0px', top: '32px', getPropertyValue: name => name === '--header-inset' ? '32px' : name === '--duration-header-enter' ? '560ms' : name === '--duration-header-exit' ? '240ms' : '900' });
globalThis.ResizeObserver = class { observe() {} };
source = readFileSync('src/scripts/header-morph/header-morph.ts', 'utf8')
  .replace("'../safe-area.ts'", JSON.stringify(new URL('../src/scripts/safe-area.ts', import.meta.url).href))
  .replace("'./header-morph-model'", JSON.stringify(new URL('../src/scripts/header-morph/header-morph-model.ts', import.meta.url).href))
  .replace("'../native-motion'", JSON.stringify(new URL('../src/scripts/native-motion.ts', import.meta.url).href))
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

document.documentElement.dataset.workStageLayout = undefined;
listeners.get('workstagelayoutchange')();
assert.equal(header.classList.contains('is-docking'), false);
assert.equal(button.parentElement, home, 'Leaving floating layout restores the genuine hero CTA');
for (let y = 600; y < 900; y++) scroll(y);
assert.equal(jobs.size, 0, 'The compact layout does not run header morph frames');
document.documentElement.dataset.workStageLayout = 'true';
listeners.get('workstagelayoutchange')();
settle();
assert.equal(header.dataset.pillState, 'expanded', 'Returning to floating layout resumes the desktop header');
