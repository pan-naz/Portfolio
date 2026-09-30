import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRoleAnimator, roleRevealEffects } from '../src/scripts/hero-role-transition.ts';

import { createNativeMotion, revealEffects } from '../src/scripts/native-motion.ts';

const allocated = [];
const timeline = { currentTime: 10000 };
class NativeAnimationDouble {
  constructor(element, frames, timing) {
    this.element = element;
    this.frames = frames;
    this.timing = timing;
    this.currentTime = 0;
    this.playState = 'running';
    this.onfinish = null;
    this.cancelled = false;
    this.playCount = 0;
    allocated.push(this);
  }
  set startTime(value) { this.start = value; this.playState = 'running'; }
  get startTime() { return this.start; }
  pause() { this.playState = 'paused'; }
  play() { this.playCount++; this.playState = 'running'; }
  cancel() { this.cancelled = true; this.playState = 'idle'; }
  finish() {
    this.currentTime = (this.timing.delay ?? 0) + this.timing.duration;
    this.playState = 'finished';
    this.onfinish?.();
  }
}
const element = () => ({
  style: {}, ownerDocument: { timeline },
  animate(frames, timing) { return new NativeAnimationDouble(this, frames, timing); },
});
const makeRoles = () => ['System thinker', 'AI builder', 'Web designer', 'App designer'].map(text => ({
  phrase: element(), letters: [...text.replaceAll(' ', '')].map(element),
}));
const live = () => allocated.filter(animation => !animation.cancelled);
const options = { hold: 1000, exit: 450, enter: 900, stagger: 35, distance: 8, ease: 'cubic-bezier(.22, .61, .36, 1)' };
const roles = makeRoles();
const motion = createRoleAnimator(roles, options);
assert.ok(roles.every(role => role.phrase.style.opacity === '0'));
motion.setPaused(true);
let initial = createNativeMotion(roleRevealEffects(roles[0], options), { paused: true });
assert.equal(live().length, roles[0].letters.length + 1);
assert.ok(live().every(animation => animation.playState === 'paused'));
assert.ok(roles[0].letters.every(letter => letter.style.opacity === '0'), 'Base glyph styles stay hidden until native effects begin');
initial.setPaused(false);
assert.ok(live().every(animation => animation.playCount === 1), 'Every paused effect explicitly resumes before clock alignment');
assert.ok(live().every(animation => animation.startTime === timeline.currentTime), 'Line and glyph animations share one native start time');

// These doubles verify scheduling/lifecycle; actual interpolation is checked in-browser.
for (let cycle = 0; cycle < 12; cycle++) {
  const index = cycle % roles.length;
  const role = roles[index];
  const group = live();
  const rise = group[0];
  const duration = options.enter + (role.letters.length - 1) * options.stagger;
  assert.equal(group.length, role.letters.length + 1, 'Only the active role owns effects');
  assert.equal(rise.timing.duration, duration);
  assert.deepEqual(rise.frames, [
    { opacity: 1, transform: 'translate3d(0px, 8px, 0px)' },
    { opacity: 1, transform: 'translate3d(0px, 0px, 0px)' },
  ]);
  group.slice(1).forEach((animation, index) => {
    assert.deepEqual(animation.frames, [{ opacity: 0 }, { opacity: 1 }], 'Glyphs fade, without separate vertical movement');
    assert.equal(animation.timing.duration, 900);
    assert.equal(animation.timing.delay, index * 35);
    assert.equal(animation.timing.fill, 'both', 'Pending stagger glyphs remain hidden');
  });

  // Pause/resume must retain progress and keep every effect synchronized.
  group.forEach(animation => { animation.currentTime = 200; });
  (cycle === 0 ? initial : motion).setPaused(true);
  assert.ok(group.every(animation => animation.playState === 'paused'));
  timeline.currentTime += 5000;
  (cycle === 0 ? initial : motion).setPaused(false);
  assert.ok(group.every(animation => animation.startTime === timeline.currentTime - 200));
  rise.finish();
  assert.equal(role.phrase.style.opacity, '1');
  assert.equal(role.phrase.style.transform, 'translate3d(0px, 0px, 0px)');
  assert.ok(role.letters.every(letter => letter.style.opacity === '1'));
  assert.ok(group.every(animation => animation.cancelled), 'Finished effects are released after endpoints are persisted');

  if (cycle === 0) {
    assert.equal(live().length, 0, 'Initial role waits for the rest of the intro before cycling');
    motion.setPaused(false);
    motion.startCycling();
  }
  const [fade] = live();
  assert.equal(live().length, 1);
  assert.equal(fade.timing.delay, 1000);
  assert.equal(fade.timing.duration, 450);
  assert.deepEqual(fade.frames, [{ opacity: 1 }, { opacity: 0 }], 'Exit never changes vertical position');
  fade.finish();
  assert.equal(role.phrase.style.opacity, '0');
  assert.equal(live()[0].element, roles[(index + 1) % roles.length].phrase);
  assert.equal(live()[0].frames[0].opacity, 1, 'The native effect exposes the incoming wrapper, not a competing inline style');
}
const staleFinish = live()[0].onfinish;
motion.destroy();
assert.equal(live().length, 0);
staleFinish();
assert.equal(live().length, 0, 'A queued callback cannot restart a disposed controller');

// The same group handles one-shot copy, pause, focus finish and cancellation.
const copy = [element(), element(), element()];
let completed = 0;
const intro = createNativeMotion(revealEffects(copy, {
  duration: 900, delay: 1575, stagger: 100, distance: 8, easing: options.ease,
}), { paused: true, onComplete: () => { completed++; } });
assert.equal(live().length, 3);
assert.ok(live().every(animation => animation.playState === 'paused'));
const lead = live().at(-1);
live().forEach(animation => { animation.currentTime = 500; });
intro.setPaused(false);
assert.ok(live().every(animation => animation.startTime === timeline.currentTime - 500));
const staleIntroFinish = lead.onfinish;
intro.finish();
assert.equal(completed, 1);
assert.equal(live().length, 0);
assert.ok(copy.every(line => line.style.opacity === '1' && line.style.transform === 'translateY(0px)'));
staleIntroFinish();
intro.finish();
assert.equal(completed, 1, 'Focus and late native completion cannot finish twice');
const cancelled = createNativeMotion(revealEffects([element()], {
  duration: 900, distance: 8, easing: options.ease,
}), { onComplete: () => { completed++; } });
const staleCancelled = live()[0].onfinish;
cancelled.cancel();
staleCancelled();
assert.equal(completed, 1);
assert.equal(live().length, 0);

for (const file of ['hero-role-transition', 'native-motion']) {
  const source = readFileSync(new URL(`../src/scripts/${file}.ts`, import.meta.url), 'utf8');
  assert.ok(!/import .*gsap|requestAnimationFrame|setTimeout|setInterval/.test(source));
}
console.log('PASS: 12 role cycles and the shared native group: synchronized playback, exact delays, stable baseline, pause/resume, endpoint commits, focus finish, bounded effects and cancellation.');
