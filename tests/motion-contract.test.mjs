import assert from'node:assert/strict';
import {validateMotionCss,validateMotionScript,validateMotionContract,motionTimingAllowlist}from'../scripts/validate-motion.mjs';
import {easeSectionScroll}from'../src/scripts/motion.ts';
assert.deepEqual(validateMotionContract(),[]);
for(const css of ['a{transition:opacity 100ms ease-out}','a{animation:rise 1s linear}','a{transition-timing-function:cubic-bezier(.2,.3,.4,1)}'])assert(validateMotionCss(css).length);
assert.deepEqual(validateMotionCss('a{transition:opacity var(--duration-fast) var(--ease-out)}'),[]);
assert.deepEqual(validateMotionCss('@media(prefers-reduced-motion:reduce){*{transition-duration:0s!important}}','src/styles/global.css'),[]);
assert(validateMotionCss('a{transition-duration:0s}','src/styles/global.css').length,'Zero timing requires the specific reduced-motion override');
for(const code of ['node.animate([],{duration:100})','node.animate([],{easing:"ease-out"})','const effect={delay:150}','const replayDuration=500'])assert(validateMotionScript(code).length);
assert.deepEqual(validateMotionScript('node.animate([],{duration:readMotionToken(css,"--duration-fast"),easing:css.getPropertyValue("--ease-out")})'),[]);
assert(motionTimingAllowlist.every(item=>item.reason.length>20));
for(let i=0;i<=100;i++){const t=i/100;assert.equal(easeSectionScroll(t),Math.min(1,1.001-2**(-10*t)),'Section scroll keeps the exact independent Lenis curve');}
console.log('PASS: typed CSS/JS timing and easing fail, reduced zero is scoped, and section scroll remains mathematically identical.');
