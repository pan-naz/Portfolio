import assert from 'node:assert/strict';
import { pillGeometry, pillProgress, pillTravel } from '../src/scripts/header-morph-model.ts';
const buttonTop = 552, inset = 32, trigger = buttonTop - inset;
for (const scroll of [0,64,200,trigger]) assert.equal(pillProgress(scroll,buttonTop,inset),0);
assert.equal(pillProgress(trigger + pillTravel / 2,buttonTop,inset),.5);
assert.equal(pillProgress(trigger + pillTravel,buttonTop,inset),1);
assert.equal(pillProgress(trigger + 2000,buttonTop,inset),1);
const forward = Array.from({length:221},(_,i)=>pillProgress(trigger+i,buttonTop,inset));
const reverse = Array.from({length:221},(_,i)=>pillProgress(trigger+220-i,buttonTop,inset));
assert.deepEqual(reverse, [...forward].reverse(), 'Scrolling up exactly reverses the merge');
assert.equal(pillProgress(trigger,buttonTop,inset,true),0);
assert.equal(pillProgress(trigger+1,buttonTop,inset,true),1);
for (const width of [320,390,768,1280,1600]) {
  const mobile = width < 768;
  const controls = mobile ? 44 : 205;
  const geometry = pillGeometry(width,controls,172,mobile);
  assert.ok(geometry.left >= 24, 'Pill stays within the viewport at mobile and desktop sizes');
  assert.equal(geometry.left + geometry.width / 2,width/2);
  assert.ok(geometry.logoX + geometry.logoWidth <= geometry.controlsX);
  assert.ok(geometry.controlsX + controls <= geometry.buttonX);
}
console.log('PASS: CTA-relative trigger, no early pill, reversible scroll progress, reduced motion and responsive geometry.');
