import assert from 'node:assert/strict';
import { initializeCaseStudyFocus } from '../src/scripts/case-study/case-study-focus.ts';

const document = new EventTarget();
document.defaultView = new EventTarget();
const focus = initializeCaseStudyFocus(document);
const element = () => ({
  marked: false,
  toggleAttribute(_name, value) { this.marked = value; },
  removeAttribute() { this.marked = false; },
  focus(options) { this.options = options; },
});
const close = element(), card = element();
const key = (value, extra = {}) => document.dispatchEvent(Object.assign(new Event('keydown'), {key:value,...extra}));
const pointer = () => document.dispatchEvent(new Event('pointerdown'));

focus.prepare(close);
assert.equal(close.marked, true, 'Initial programmatic dialog focus does not invent keyboard input');
key('Shift');
assert.equal(close.marked, true, 'A modifier alone does not expose the ring');
key('Tab', {isComposing:true});
assert.equal(close.marked, true, 'Composition does not change focus modality');
key('Tab');
assert.equal(close.marked, false, 'Tab immediately restores the existing keyboard focus styling');
focus.focus(card);
assert.equal(card.marked, false, 'Keyboard closing restores visible focus to the originating card');
assert.deepEqual(card.options, {preventScroll:true}, 'Return focus must not move the restored viewport');
pointer();
assert.equal(card.marked, true, 'Switching from keyboard to pointer suppresses the owned return ring');
focus.prepare(close);
assert.equal(close.marked, true, 'Pointer opening suppresses the close-button ring before showModal');
key('Escape');
assert.equal(close.marked, false, 'Escape is a keyboard close, including after a touch open');
assert.equal(card.marked, false, 'All pending native/explicit return targets follow the current modality');
pointer();
const blur = new Event('focusout');
Object.defineProperty(blur, 'target', {value:card});
document.dispatchEvent(blur);
assert.equal(card.marked, false, 'Focus leaving a target removes its temporary marker');
key('Tab');pointer();
assert.equal(card.marked, false, 'An old target is no longer managed after blur');
const cached = new Event('pagehide');Object.defineProperty(cached,'persisted',{value:true});
document.defaultView.dispatchEvent(cached);key('Tab');
assert.equal(close.marked,false,'BFCache retains modality handling');
pointer();
document.defaultView.dispatchEvent(new Event('pagehide'));
assert.equal(close.marked,false,'Document teardown removes all markers and listeners');
focus.prepare(card);key('Tab');
assert.equal(card.marked,true,'The key listener was removed at teardown');
focus.destroy();

// Native dialog.close() can restore focus before the animated return finishes.
// Verify both preparations across repeated opens, including an intervening blur
// before the final explicit return and a subsequent keyboard close.
const returnDocument = new EventTarget();
returnDocument.defaultView = new EventTarget();
const returns = initializeCaseStudyFocus(returnDocument);
const returnTarget = () => ({
  ...element(), moves: [],
  focus(options) { this.moves.push({ marked: this.marked, options }); },
});
const returnCard = returnTarget(), returnClose = returnTarget();
const leave = target => {
  const event = new Event('focusout');
  Object.defineProperty(event, 'target', { value: target });
  returnDocument.dispatchEvent(event);
};
for (const pointerType of ['mouse', 'touch']) {
  returnDocument.dispatchEvent(Object.assign(new Event('pointerdown'), { pointerType }));
  leave(returnCard);
  returns.prepare(returnClose); returnClose.focus();
  assert.equal(returnClose.moves.at(-1).marked, true, `${pointerType}: native autofocus is prepared`);
  returns.prepare(returnCard); returnCard.focus();
  leave(returnClose);
  assert.equal(returnCard.moves.at(-1).marked, true, `${pointerType}: native close restores pointer-owned focus`);
  leave(returnCard);
  assert.equal(returnCard.marked, false, 'Intervening blur removes the temporary marker');
  returns.focus(returnCard);
  assert.deepEqual(returnCard.moves.at(-1), { marked: true, options: { preventScroll: true } }, `${pointerType}: final explicit return re-prepares the blurred target without scrolling`);

  returnDocument.dispatchEvent(Object.assign(new Event('pointerdown'), { pointerType }));
  leave(returnCard);
  returns.prepare(returnClose); returnClose.focus();
  returnDocument.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }));
  returns.prepare(returnCard); returnCard.focus();
  leave(returnClose);
  assert.equal(returnCard.moves.at(-1).marked, false, `${pointerType}: native Escape return permits the full keyboard ring`);
  returns.focus(returnCard);
  assert.deepEqual(returnCard.moves.at(-1), { marked: false, options: { preventScroll: true } }, 'Final Escape return keeps visible keyboard focus without scrolling');
}
returns.destroy();
assert.equal(returnCard.marked, false);
console.log('PASS: Case-study focus preserves keyboard rings, pointer/touch suppression, return position, blur cleanup and BFCache lifetime.');
