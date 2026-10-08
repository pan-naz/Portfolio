import assert from 'node:assert/strict';
import { initializeCaseStudyImages } from '../src/scripts/case-study-images.ts';

const reduced = Object.assign(new EventTarget(), { matches: false });
const page = Object.assign(new EventTarget(), { hidden: false });
const observers = [];
class Observer {
  constructor(callback) { this.callback = callback; observers.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
  emit(image, ratio) { this.callback([{ target: image, isIntersecting: ratio > 0, intersectionRatio: ratio }]); }
}
const original = { fetch: globalThis.fetch, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
Object.assign(globalThis, { document: page, matchMedia: () => reduced, IntersectionObserver: Observer });
let requested = 0;
let created = 0;
const revoked = [];
globalThis.fetch = async () => { requested++; return { ok: true, blob: async () => new Blob(['original frames']) }; };
URL.createObjectURL = () => `blob:recording-${++created}`;
URL.revokeObjectURL = url => revoked.push(url);
const flush = () => new Promise(resolve => setImmediate(resolve));
const image = { src: 'still.webp', dataset: { caseAnimatedImage: 'animation.webp' }, getAttribute: () => 'still.webp' };
const root = { querySelectorAll: () => [image] };
try {
  const controller = initializeCaseStudyImages(root);
  assert.equal(initializeCaseStudyImages(root), controller, 'A root owns only one image observer');
  observers[0].emit(image, .4);
  await flush();
  assert.equal(requested, 0, 'The still remains until at least half of the recording is visible');
  observers[0].emit(image, .5);
  await flush();
  assert.equal(image.src, 'blob:recording-1');
  observers[0].emit(image, .2);
  assert.equal(image.src, 'blob:recording-1', 'Once started, the piece may finish while partly visible');
  observers[0].emit(image, 0);
  assert.equal(image.src, 'still.webp');
  assert.deepEqual(revoked, ['blob:recording-1']);
  observers[0].emit(image, .5);
  await flush();
  assert.equal(image.src, 'blob:recording-2', 'Reentry starts fresh playback of the unchanged bytes');
  assert.equal(requested, 1, 'Reentry reuses the fetched original file');
  reduced.matches = true;
  reduced.dispatchEvent(new Event('change'));
  assert.equal(image.src, 'still.webp', 'Reduced motion resolves to the original static state');
  reduced.matches = false;
  reduced.dispatchEvent(new Event('change'));
  await flush();
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(image.src, 'still.webp', 'Hidden pages release animated image URLs');
  page.hidden = false;
  page.dispatchEvent(new Event('visibilitychange'));
  await flush();
  controller.destroy();
  assert.equal(image.src, 'still.webp');
  assert.ok(observers[0].disconnected);

  let complete;
  let signal;
  globalThis.fetch = (_, options) => { signal = options.signal; return new Promise(resolve => { complete = resolve; }); };
  const next = initializeCaseStudyImages(root);
  observers[1].emit(image, 1);
  next.destroy();
  complete({ ok: true, blob: async () => new Blob(['late file']) });
  await flush();
  assert.ok(signal.aborted, 'Closing an opened case cancels its pending image request');
  assert.equal(image.src, 'still.webp', 'A late request cannot restart a closed case');
  assert.equal(created, 4, 'Late bytes do not create an unreleased object URL');
} finally {
  globalThis.fetch = original.fetch;
  URL.createObjectURL = original.create;
  URL.revokeObjectURL = original.revoke;
}
console.log('PASS: original image previews start in view, replay on reentry, keep reduced-motion stills and release/cancel resources when a case closes.');
