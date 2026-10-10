import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { readMotionToken, revealEffects, parallelRevealEffects, motionEndTime } from '../src/scripts/native-motion.ts';
import { heroIntroTiming } from '../src/scripts/hero-intro.ts';
import { impactGroups } from '../src/data/portfolio.ts';
import { readCaseStudyMotion, caseStudyMotionTokens, caseStudyPresentationTokens } from '../src/scripts/case-study/case-study-motion.ts';

const style = values => ({ getPropertyValue: name => values[name] ?? '' });
for (const [value, expected] of [
  ['900ms', 900], ['.9s', 900], ['1s', 1000], ['35ms', 35],
  [' .035s ', 35], ['0s', 0], ['-.1s', -100],
  ['620', 620], ['.5', .5], ['8px', 8],
]) {
  assert.equal(readMotionToken(style({ time: value }), 'time'), expected, value);
}
assert.ok(Number.isNaN(readMotionToken(style({}), 'missing')), 'Missing optional tokens retain their fallback behavior');

const parseTokens = css => style(Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map(match => [match[1], match[2]])));
const source = parseTokens(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'));
const caseMotion = readCaseStudyMotion(source);
assert.equal(caseMotion.openDuration, 700);
assert.equal(caseMotion.closeDuration, 400);
assert.equal(caseMotion.captionEnterDelay + caseMotion.captionEnterDuration, 700);
assert.equal(caseMotion.bodyEnterDelay + caseMotion.bodyEnterDuration, caseMotion.openDuration, 'Body and hero finish the shared opening together');
assert.equal(caseMotion.copyDistance, 16);
assert.equal(caseMotion.controlSize, 44);
const changed = style(Object.fromEntries([...caseStudyMotionTokens, ...caseStudyPresentationTokens, { name: '--space-4' }, { name: '--control-icon' }].map(({ name }) => [name, source.getPropertyValue(name)])));
const altered = { getPropertyValue: name => name === '--duration-case-open' ? '1.2s' : changed.getPropertyValue(name) };
assert.equal(readCaseStudyMotion(altered).openDuration, 1200, 'Changing a shared token changes the consumed timing without a controller-local constant');
const schedule = tokens => {
  const number = name => readMotionToken(tokens, name);
  const timing = heroIntroTiming(15, number('--duration-title-reveal'), number('--stagger-title-reveal'),
    number('--duration-entrance'), number('--duration-copy-reveal'), number('--intro-stage-progress'));
  return {
    timing,
    title: revealEffects(Array.from({ length: 15 }, () => ({})), {
      duration: number('--duration-title-reveal'), delay: timing.titleStart,
      stagger: number('--stagger-title-reveal'), distance: number('--distance-text-reveal'), easing: 'ease-out',
    }),
    hold: number('--duration-role-hold'),
    exit: number('--duration-role-exit'),
  };
};
const expected = schedule(source);
assert.equal(expected.timing.titleStart, 900);
assert.equal(expected.timing.roleStart, 1350);
assert.equal(expected.timing.ctaStart, 2250);
assert.equal(expected.title[0].duration, 900);
assert.equal(expected.title[1].delay - expected.title[0].delay, 35);
assert.equal(expected.hold, 1000);
assert.equal(expected.exit, 450);

const metricSchedule = tokens => {
  const number = name => readMotionToken(tokens, name);
  const options = { duration: number('--duration-title-reveal'), stagger: number('--stagger-title-reveal'), distance: number('--distance-title-reveal'), easing: tokens.getPropertyValue('--ease-entrance') };
  let delay = 1350;
  return impactGroups.map(group => {
    const columns = group.metrics.map(({ value }) => [...value].map((glyph, index) => ({ glyph, index })));
    const effects = parallelRevealEffects(columns, { ...options, delay });
    for (const column of columns) {
      const ownEffects = effects.filter(effect => column.includes(effect.element));
      assert.deepEqual(ownEffects, revealEffects(column, { ...options, delay }), 'Every metric uses the title recipe with its own glyph stagger');
      assert.equal(ownEffects[0].delay, delay, 'All three metrics in a row start together');
    }
    const end = motionEndTime(effects);
    const result = { start: delay, end, timing: effects.map(({ element, ...effect }) => effect) };
    delay = end;
    return result;
  });
};
const metrics = metricSchedule(source);
assert.equal(metrics[0].start, 1350, 'Numbers keep the existing first-content handoff');
assert.equal(metrics[0].end, 2390, 'The top row includes the last glyph of its longest value');
assert.equal(metrics[1].start, metrics[0].end, 'The bottom row waits for the complete top row');
assert.equal(metrics[1].end, 3430);
assert.deepEqual(metrics[0].timing[0].keyframes, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0px)' }]);

// Run after `pnpm build` to exercise the actual CSS optimizer's output.
if (process.argv.includes('--built')) {
  const assets = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(assets).filter(name => name.endsWith('.css'))
    .map(name => readFileSync(new URL(name, assets), 'utf8'))
    .find(css => css.includes('--duration-title-reveal:'));
  assert.ok(css, 'Production motion tokens must exist');
  const built = parseTokens(css);
  assert.deepEqual(readCaseStudyMotion(built), caseMotion, 'All case-study timings, easing and control geometry survive production CSS optimization');
  for (const name of [...readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
    .matchAll(/(--(?:duration|stagger|delay)-[\w-]+)\s*:/g)].map(match => match[1])) {
    assert.equal(readMotionToken(built, name), readMotionToken(source, name), `${name} must retain its timing after CSS optimization`);
  }
  assert.deepEqual(schedule(built), expected, 'Production hero choreography must match development, including every letter delay');
  assert.deepEqual(metricSchedule(built), metrics, 'Production Impact rows retain simultaneous columns and the complete-row handoff');
}
console.log('PASS: motion tokens preserve units, the hero schedule and simultaneous metric columns followed by the next complete row.');
