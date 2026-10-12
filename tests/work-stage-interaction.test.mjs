import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createNativeMotion, readMotionToken, revealEffects } from '../src/scripts/native-motion.ts';
import { canShiftWorkStage, nextWorkStageExpanded, shouldRevealWorkContent } from '../src/scripts/work-stage/work-stage-model.ts';

// Run the real stage controller and native-motion lifecycle with a controllable
// browser clock. Glyph measurement is covered separately by the reveal tests.
const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
let created = [], revealCalls = 0;
class ElementDouble extends EventTarget {
  constructor() {
    super(); this.style = {}; this.selectors = {}; this.top = 700;
    const classes = new Set();
    this.classList = {
      contains: name => classes.has(name),
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
    };
    this.ownerDocument = document;
  }
  querySelector(selector) { return this.selectors[selector]?.[0]; }
  querySelectorAll(selector) { return this.selectors[selector] ?? []; }
  getBoundingClientRect() { return { top: this.top }; }
  animate(keyframes, timing) {
    const animation = {
      element: this, keyframes, timing, currentTime: 0, active: true,
      pause() { this.paused = true; },
      play() { this.paused = false; },
      cancel() { this.active = false; },
      complete() { if (this.active) this.onfinish?.(); },
    };
    created.push(animation);
    return animation;
  }
}
globalThis.workStageTestImports = {
  createNativeMotion, readMotionToken, revealEffects, canShiftWorkStage, nextWorkStageExpanded, shouldRevealWorkContent,
  sectionRevealEffects(title, index, description, content) {
    revealCalls++;
    title.style.opacity = '1';
    return [title.glyph, index, description, ...content].map(element => ({
      element, keyframes: [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0px)' }],
      duration: 900, easing: 'ease-out',
    }));
  },
};
let runtime = readFileSync(new URL('../src/scripts/work-stage/work-stage.ts', import.meta.url), 'utf8');
runtime = runtime.replace(/^import .*;\n/gm, '');
runtime = 'const { createNativeMotion, readMotionToken, revealEffects, sectionRevealEffects, canShiftWorkStage, nextWorkStageExpanded, shouldRevealWorkContent } = globalThis.workStageTestImports;\n' + runtime;
runtime = ts.transpileModule(runtime, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeWorkStage } = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);

function fixture(fontsReady = Promise.resolve(), returningFromCase = false, floating = true, touch = false) {
  created = []; revealCalls = 0;
  globalThis.document = { hidden: false, documentElement: { dataset: { workStageMotion: floating ? 'true' : undefined, workStageLayout: floating ? 'true' : undefined, workPreviewLayout: 'true' } }, timeline: { currentTime: 0 }, fonts: { ready: fontsReady } };
  if (returningFromCase) document.documentElement.dataset.caseReturn = 'true';
  if (touch) document.documentElement.dataset.workTouchPreview = 'true';
  const section = new ElementDouble(), surface = new ElementDouble(), panel = new ElementDouble(), rail = new ElementDouble();
  const heading = new ElementDouble(), title = new ElementDouble(), index = new ElementDouble(), description = new ElementDouble(), card = new ElementDouble();
  const compactFilter = new ElementDouble();
  title.glyph = new ElementDouble();
  section.selectors = { '[data-work-stage-surface]': [surface], '.work-panel': [panel], '[data-work-rail]': [rail], '.section-heading': [heading], '[data-section-item]': [card] };
  section.selectors['.work-compact-filter'] = [compactFilter];
  heading.selectors = { h2: [title], '.section-index > *': [index], '.section-description': [description] };
  document.querySelector = () => section;
  const reduced = new EventTarget(); reduced.matches = false;
  globalThis.matchMedia = query => query.includes('reduced-motion') ? reduced : { matches: true };
  Object.defineProperty(globalThis, 'navigator', { value: { maxTouchPoints: 0 }, configurable: true });
  globalThis.window = new EventTarget(); window.scrollY = 0; window.innerHeight = 900;
  const frames = new Map(); let frameId = 0;
  globalThis.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  globalThis.getComputedStyle = element => {
    const sample = property => {
      const animation = created.findLast(a => a.active && a.element === element && a.keyframes[0][property] !== undefined);
      return animation?.keyframes[0][property] ?? element.style[property];
    };
    return {
      opacity: String(sample('opacity') ?? '1'), transform: sample('transform') ?? 'none',
      borderRadius: sample('borderRadius') || (document.documentElement.dataset.workStageLayout === 'true' ? '80px 0px 0px 80px' : '0px'), display: 'block',
      getPropertyValue: name => tokens.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1] ?? '',
    };
  };
  const controller = initializeWorkStage();
  const scroll = async (y, top) => {
    window.scrollY = y; section.top = top; window.dispatchEvent(new Event('scroll'));
    for (const [id, callback] of frames) { frames.delete(id); callback(); }
    await Promise.resolve();
  };
  const complete = () => {
    for (const animation of created) animation.complete();
  };
  const resize = async floating => {
    document.documentElement.dataset.workStageLayout = floating ? 'true' : undefined;
    window.dispatchEvent(new Event('workstagelayoutchange'));
    window.dispatchEvent(new Event('resize'));
    for (const [id, callback] of frames) { frames.delete(id); callback(); }
    await Promise.resolve();
  };
  return { section, panel, rail, compactFilter, title, index, description, card, controller, reduced, scroll, complete, resize };
}
const resting = 'translate(var(--hero-visual-gutter), 0px)';
const expanded = 'translate(0px, 0px)';
const returned = fixture(Promise.resolve(), true);
assert.equal(returned.panel.style.transform, expanded, 'A case return restores the fully expanded collection before painting');
assert.equal(returned.panel.style.borderRadius, '0px');
assert.ok([returned.title, returned.card, returned.rail].every(element => element.style.opacity === '1'), 'The returned collection and menu are visible without another entrance');
assert.equal(revealCalls, 0, 'Returning to a previously visited collection cannot replay its title/card entrance');
await returned.scroll(0, 700);
returned.complete();
assert.equal(returned.panel.style.transform, resting, 'Later scrolling to the intro retains the normal Work preview');
assert.ok([returned.title, returned.index, returned.description, returned.card].every(element => element.style.opacity === '1'), 'A visited collection stays visible after returning to the top');
const f = fixture();
assert.equal(f.panel.style.transform, resting);
assert.equal(f.title.style.opacity, '0');
f.section.dispatchEvent(new Event('workfilterchange'));
assert.equal(created.length, 0, 'A category update at page top cannot expand the Work preview');
assert.equal(f.title.style.opacity, '0');
await f.scroll(20, 680);
assert.equal(revealCalls, 1, 'Scrolling into the chapter starts its existing shared text reveal');
assert.equal(f.section.classList.contains('is-work-expanded'), false);
await f.scroll(0, 700);
assert.ok([f.title, f.index, f.description, f.card].every(element => element.style.opacity === '1'), 'Returning to the top keeps the one-time reveal visible before the background has expanded');
assert.equal(f.title.glyph.style.opacity, '1', 'An interrupted reveal settles without hiding its parent');
await f.scroll(700, 0);
f.complete();
assert.equal(f.panel.style.transform, expanded);
assert.equal(f.panel.style.borderRadius, '0px');
assert.equal(f.title.style.opacity, '1');
assert.equal(f.rail.style.opacity, '1');
assert.equal(revealCalls, 1, 'Re-entering restores completed glyphs without replaying the title');
await f.scroll(0, 700);
assert.equal(f.title.style.opacity, '1', 'The completed title remains visible when scrolling back to the top');
f.complete();
assert.equal(f.panel.style.transform, resting);
assert.equal(f.panel.style.borderRadius, '80px 0px 0px 80px');
assert.equal(f.rail.style.opacity, '0');
assert.equal(f.section.classList.contains('is-work-shifting'), false);
f.section.dispatchEvent(new Event('focusin'));
f.complete();
assert.equal(f.title.style.opacity, '1', 'Keyboard access resolves the hidden chapter');
assert.equal(f.panel.style.transform, expanded);
f.reduced.matches = true; f.reduced.dispatchEvent(new Event('change'));
await f.scroll(0, 700);
assert.equal(f.title.style.opacity, '1', 'Reduced motion retains readable static content at the top');
assert.equal(f.panel.style.transform, expanded);

let finishFonts;
const pending = fixture(new Promise(resolve => { finishFonts = resolve; }));
await pending.scroll(20, 680);
await pending.scroll(0, 700);
finishFonts(); await Promise.resolve();
assert.equal(revealCalls, 0, 'A delayed font load cannot replay an already resolved entrance');
assert.equal(pending.title.style.opacity, '1', 'Returning to the top resolves a pending entrance visibly');
await pending.scroll(700, 0); pending.complete();
assert.equal(pending.title.style.opacity, '1', 'The cancelled font wait does not strand the chapter hidden');
const refreshed = fixture();
await refreshed.scroll(0, 700);
assert.equal(refreshed.title.style.opacity, '0', 'A fresh page resets the reveal until the chapter is entered');
assert.equal(revealCalls, 0);
console.log('PASS: fresh-page reset, persistent reveal, category restoration, scroll return, interrupted reveal, delayed fonts, keyboard access and reduced-motion Work stage lifecycle.');

const compact = fixture(Promise.resolve(), false, false);
assert.equal(compact.panel.style.transform, expanded);
assert.notEqual(compact.compactFilter.style.opacity, '0', 'Narrow mouse filter visibility remains unchanged');
assert.equal(compact.title.style.opacity, '0', 'Every non-floating input starts with an empty first-screen Work preview');
await compact.scroll(1, 680);
assert.equal(compact.title.style.opacity, '0', 'One pixel of scrolling cannot bypass the shared reveal threshold');
await compact.scroll(700, 0); compact.complete();
assert.equal(created.filter(a => a.element === compact.panel).length, 0, 'Narrow mouse scrolling never animates the background');
assert.equal(compact.title.style.opacity, '1', 'Existing narrow mouse content reveal is preserved');
await compact.resize(true); compact.complete();
assert.equal(compact.panel.style.transform, expanded);
assert.equal(compact.section.classList.contains('work-stage-can-shift'), true, 'Compact startup can become floating without a reload');
await compact.scroll(0, 700);
assert.ok(created.some(a => a.active && a.element === compact.panel), 'Desktop reverse motion starts with its original timeline');
await compact.resize(false);
assert.equal(compact.panel.style.transform, expanded);
assert.equal(compact.panel.style.borderRadius, '0px');
assert.equal(created.filter(a => a.active && a.element === compact.panel).length, 0, 'Leaving floating layout cancels in-flight effects');
assert.equal(compact.section.classList.contains('is-work-shifting'), false);
assert.equal(compact.title.style.opacity, '1', 'Resize cannot replay or hide visited content');
await compact.resize(true);
assert.equal(compact.panel.style.transform, resting, 'Returning at page top restores the desktop preview immediately');
assert.equal(compact.panel.style.borderRadius, '80px 0px 0px 80px');
assert.equal(compact.rail.style.opacity, '0');
console.log('PASS: live compact/floating layout changes cancel background motion and preserve visited content.');

const touch = fixture(Promise.resolve(), false, false, true);
assert.equal(touch.compactFilter.style.opacity, '0', 'Fresh touch previews hide the filter and its shadow');
assert.equal(touch.compactFilter.style.pointerEvents, 'none', 'The blank touch preview has no invisible filter hit targets');
await touch.scroll(1, 680);
assert.equal(touch.compactFilter.style.opacity, '0');
await touch.scroll(20, 660);
const filterMotion = created.find(a => a.element === touch.compactFilter);
assert.ok(filterMotion, 'The touch filter joins the shared heading timeline');
assert.equal(filterMotion.timing.duration, 900);
assert.equal(filterMotion.timing.delay, 0, 'The filter starts with the heading reveal');
assert.equal(filterMotion.keyframes[0].opacity, 0);
assert.equal(filterMotion.keyframes[0].transform, 'translateY(8px)');
assert.equal(touch.compactFilter.style.opacity, '0', 'The underlying filter stays hidden until native effects paint');
touch.controller.setPaused(true);
assert.equal(filterMotion.paused, true, 'Dialog/hidden-page pause also pauses the filter');
touch.controller.setPaused(false);
assert.equal(filterMotion.paused, false);
touch.complete();
assert.equal(touch.compactFilter.style.opacity, '1', 'The native endpoint keeps the completed filter visible');
assert.equal(touch.compactFilter.style.pointerEvents, '');
await touch.scroll(0, 680);
assert.equal(touch.compactFilter.style.opacity, '1', 'Returning after a reveal retains the visited filter');
const touchReturn = fixture(Promise.resolve(), true, false, true);
assert.equal(touchReturn.compactFilter.style.opacity, '1', 'Case return exposes the already visited filter');
const reducedTouch = fixture(Promise.resolve(), false, false, true);
reducedTouch.reduced.matches = true;
reducedTouch.reduced.dispatchEvent(new Event('change'));
assert.equal(reducedTouch.compactFilter.style.opacity, '', 'Reduced motion clears the hiding override for immediate display');
let resolveTouchFonts;
const pendingTouch = fixture(new Promise(resolve => { resolveTouchFonts = resolve; }), false, false, true);
await pendingTouch.scroll(20, 660);
assert.equal(pendingTouch.compactFilter.style.opacity, '0', 'Pending fonts cannot flash the filter before the heading starts');
await pendingTouch.scroll(0, 700);
assert.equal(pendingTouch.compactFilter.style.opacity, '1', 'Returning to the top resolves even a pending filter entrance');
resolveTouchFonts(); await Promise.resolve();
assert.ok(!created.some(a => a.element === pendingTouch.compactFilter), 'Resolved pending entrances cannot restart');
const keyboardTouch = fixture(Promise.resolve(), false, false, true);
keyboardTouch.section.dispatchEvent(new Event('focusin'));
assert.equal(keyboardTouch.compactFilter.style.opacity, '1', 'Keyboard access immediately reveals the filter');
console.log('PASS: touch filter shared motion, pause/resume, font waits, keyboard access, visit/case return and reduced motion.');
