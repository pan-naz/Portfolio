import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { readMotionToken, revealEffects } from '../src/scripts/native-motion.ts';
import { heroIntroTiming } from '../src/scripts/hero-intro.ts';

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

// Run after `pnpm build` to exercise the actual CSS optimizer's output.
if (process.argv.includes('--built')) {
  const assets = new URL('../dist/_astro/', import.meta.url);
  const css = readdirSync(assets).filter(name => name.endsWith('.css'))
    .map(name => readFileSync(new URL(name, assets), 'utf8'))
    .find(css => css.includes('--duration-title-reveal:'));
  assert.ok(css, 'Production motion tokens must exist');
  const built = parseTokens(css);
  for (const name of [...readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
    .matchAll(/(--(?:duration|stagger|delay)-[\w-]+)\s*:/g)].map(match => match[1])) {
    assert.equal(readMotionToken(built, name), readMotionToken(source, name), `${name} must retain its timing after CSS optimization`);
  }
  assert.deepEqual(schedule(built), expected, 'Production hero choreography must match development, including every letter delay');
}
console.log('PASS: motion tokens preserve milliseconds, seconds, unitless values and the approved hero schedule.');
