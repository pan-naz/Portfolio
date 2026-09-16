import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { advancePill, advancePillExit, nextPillState, pillDockOffset, pillDuration, pillExitDuration, pillExitY, pillReturnViewportBuffer, pillShape, pillLabels, pillGeometry } from '../src/scripts/header-morph-model.ts';
const source = readFileSync(new URL('../src/scripts/header-morph.ts', import.meta.url), 'utf8');
const trigger = 520;
const desktopSpacing = pillGeometry(1280, 218, 172, false);
assert.equal(desktopSpacing.logoWidth, 44, 'Preserve the desktop logo click area');
assert.equal(desktopSpacing.logoX - desktopSpacing.left, 20, 'Compact logo wrapper has a comfortable pill-edge inset');
assert.equal(desktopSpacing.controlsX - (desktopSpacing.logoX + desktopSpacing.logoWidth), 12, 'Use space/12 between horizontal pill components');
assert.equal(desktopSpacing.left + desktopSpacing.width - (desktopSpacing.buttonX + 172), 8, 'Button-to-pill right gap');
assert.equal(desktopSpacing.buttonX - (desktopSpacing.controlsX + 218), 12, 'Use space/12 between horizontal pill components');
assert.equal(desktopSpacing.width, 486, 'Apply consistent space/12 gaps without changing button or control targets');
for (const scroll of [0,64,200,519]) assert.equal(nextPillState(scroll,scroll,trigger,280,false,false).expanded,false);
assert.equal(nextPillState(trigger,trigger,trigger,280,false,false).expanded,true);
let returnState = nextPillState(trigger + 279, trigger + 300, trigger, 280, true, false);
assert.deepEqual(returnState, { expanded: false, releasing: true }, 'Return starts while the hero CTA remains above the viewport');
returnState = nextPillState(trigger + 200, trigger + 200, trigger, 280, returnState.expanded, returnState.releasing);
assert.deepEqual(returnState, { expanded: false, releasing: true }, 'A stationary frame cannot re-expand an exiting pill');
returnState = nextPillState(trigger + 100, trigger + 200, trigger, 280, returnState.expanded, returnState.releasing);
assert.deepEqual(returnState, { expanded: false, releasing: true }, 'The exit remains latched while scrolling toward the hero');
assert.deepEqual(nextPillState(trigger - 1, trigger + 100, trigger, 280, false, true), { expanded: false, releasing: false });
assert.deepEqual(nextPillState(trigger + 140, trigger + 100, trigger, 280, false, true), { expanded: true, releasing: false }, 'Reversing direction restores the pill');
for (const fps of [30,60,120,144]) {
  let progress = 0;
  const expanded = nextPillState(trigger,trigger,trigger,280,false,false).expanded;
  // No additional scroll events: elapsed time alone completes playback.
  for (let i=0;i<Math.ceil(pillDuration/(1000/fps))+1;i++) progress=advancePill(progress,expanded,1000/fps);
  assert.equal(progress,1);
  let exit = 0;
  for (let i=0;i<Math.ceil(pillExitDuration/(1000/fps))+1;i++) {
    progress=advancePill(progress,false,1000/fps);
    exit=advancePillExit(exit,false,1000/fps);
    assert.equal(progress,1,'Capsule remains expanded throughout slide-up exit');
  }
  assert.equal(exit,1);
  assert.ok(pillExitY(exit,32)+32+64<0,'Entire pill is above the viewport before restoring hero CTA');
}
assert.equal(advancePill(.4,true,0),.4,'Scroll events alone cannot scrub the timeline');
const midpoint = advancePill(0,true,pillDuration/2);
assert.equal(midpoint,.5);
assert.equal(advancePill(midpoint,false,pillDuration/4),.5,'Interrupted entry freezes geometry instead of reversing');
assert.equal(advancePill(.4,true,0,true),1);
assert.equal(advancePillExit(.4,false,0,true),1);
assert.equal(advancePillExit(.4,true,0,true),0);
assert.equal(pillDuration,560,'Responsive 560ms entry');
assert.equal(pillExitDuration,240,'Separate 240ms upward exit');
assert.equal(pillReturnViewportBuffer,0,'The pill waits until the hero CTA starts entering the viewport');
assert.ok(source.includes("createNativeMotion(revealEffects([buttonHome]"), 'Returned CTA reuses the shared intro reveal recipe');
assert.ok(source.includes("--duration-copy-reveal") && source.includes("--distance-text-reveal") && source.includes("--ease-entrance"), 'Returned CTA consumes the same motion tokens as its intro');
assert.ok(source.includes("reduced.matches || typeof buttonHome.animate !== 'function' || focused"), 'Reduced motion and keyboard focus reveal the returned CTA immediately');
assert.equal(pillLabels(.56),0,'Content stays hidden during initial expansion');
assert.ok(pillShape(.56)>.65,'Most capsule growth precedes labels');
const samples = Array.from({length:1001},(_,i)=>pillShape(i/1000));
assert.equal(samples[0],0);
assert.ok(samples.every((value,i)=>value>=0 && value<=1 && (i===0 || value>=samples[i-1])),'Smooth monotonic entry, no bounce or overshoot');
assert.ok(pillShape(.2)<.15,'Gentle initial acceleration');
assert.equal(pillExitY(0,32),0);
assert.ok(pillExitY(.5,32)<0);
assert.equal(pillDockOffset(0,32),0,'Pill starts from the CTA trigger position without a jump');
assert.equal(pillDockOffset(1,32),-16,'Desktop pill settles 50% closer to the viewport top');
assert.equal(pillDockOffset(1,24),-12,'Mobile pill settles 50% closer to the viewport top');
assert.ok(advancePillExit(.5,true,16)<.5,'Direction changes can resume visibility without a jump');
assert.equal(pillShape(1),1); assert.equal(pillLabels(1),1);
for (const width of [320,390,768,1280,1600]) {
  const mobile=width<768, controls=mobile?44:218;
  const geometry=pillGeometry(width,controls,172,mobile);
  assert.ok(geometry.left>=(mobile?16:24));
  assert.equal(geometry.left+geometry.width/2,width/2);
  assert.ok(geometry.logoX+geometry.logoWidth<=geometry.controlsX);
  assert.ok(geometry.controlsX+controls<=geometry.buttonX);
}
const mobileSpacing = pillGeometry(320,44,172,true);
assert.equal(mobileSpacing.logoX-mobileSpacing.left,12);
assert.equal(mobileSpacing.controlsX-(mobileSpacing.logoX+mobileSpacing.logoWidth),12);
assert.equal(mobileSpacing.buttonX-(mobileSpacing.controlsX+44),12);
console.log('PASS: responsive 560ms entry at 30–144Hz, single CTA with viewport-edge return release, independent 240ms upward exit, no reverse morph, no overshoot, late labels, reduced motion, responsive geometry.');
