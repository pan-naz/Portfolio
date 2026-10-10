import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateVectorSvg, validateSvgAssets } from '../scripts/validate-svg-assets.mjs';
import { prepareSvgAsset, rescopeSvgAssets } from '../src/scripts/svg-asset.ts';

const vector = '<svg viewBox="0 0 24 24"><path d="M4 12h16" /></svg>';
assert.deepEqual(validateVectorSvg(vector, 'vector'), []);
for (const bitmap of [
  '<svg viewBox="0 0 24 24"><image href="icon.png" /></svg>',
  '<svg viewBox="0 0 24 24"><path d="M0 0"/><image href="data:image/png;base64,abc" /></svg>',
  '<svg viewBox="0 0 24 24"><foreignObject><img src="logo.jpg"/></foreignObject></svg>',
]) assert.ok(validateVectorSvg(bitmap, 'bitmap').some(error => error.includes('vector geometry')), 'Reject bitmap wrappers masquerading as SVG');
assert.ok(validateVectorSvg('<svg><path d="M0 0" /></svg>', 'missing viewBox').length);
assert.ok(validateVectorSvg('<svg viewBox="0 0 0 24"><path d="M0 0" /></svg>', 'empty viewBox').length);
assert.ok(validateVectorSvg('<svg viewBox="0 0 24 24"><path d="M0 0" fill="url(logo.png)" /></svg>', 'external bitmap').some(error => error.includes('references')));
assert.deepEqual(validateVectorSvg('<svg viewBox="0 0 24 24"><defs><linearGradient id="ink"/></defs><path d="M0 0" fill="url(#ink)" /></svg>', 'internal gradient'), []);
assert.deepEqual(validateSvgAssets().errors, []);
const hooko = readFileSync(new URL('../public/projects/hooko-case-study/hooko-logo.svg', import.meta.url), 'utf8');
const card = prepareSvgAsset(hooko, 'card');
const caseStudy = prepareSvgAsset(hooko, 'case');
assert.equal(card.attributes.viewBox, '0 0 1024 1024', 'Keep the original logo coordinate system');
assert.equal(card.attributes.fill, 'none');
assert.ok(!('width' in card.attributes) && !('height' in card.attributes), 'Consumer dimensions control the shared SVG');
const ids = body => [...body.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
assert.ok(ids(card.body).length > 0);
assert.ok(ids(card.body).every(id => !ids(caseStudy.body).includes(id)), 'Repeated logos have distinct gradient, filter and clip identifiers');
for (const rendered of [card, caseStudy]) {
  for (const [, id] of rendered.body.matchAll(/url\(#([^)]*)\)/g)) assert.ok(ids(rendered.body).includes(id), 'Every vector fragment resolves inside its own logo instance');
}
const linked = prepareSvgAsset('<svg viewBox="0 0 24 24"><defs><path id="mark" d="M0 0h24"/></defs><use href="#mark" fill="#fff"/></svg>', 'copy');
assert.ok(linked.body.includes('href="#copy-mark"') && linked.body.includes('fill="#fff"'), 'Namespace fragment references without rewriting colours');
assert.throws(() => prepareSvgAsset('<svg><path d="M0 0"/></svg>', 'invalid'), /viewBox/);
// Exercise the runtime transition copier with the actual shared marks. Hiding
// the source must never remove a copied leaf, gradient, filter or clip.
const logoAssets = ['yellow-leaf-case-study/logo.svg', 'hooko-case-study/hooko-logo.svg', 'voximplant-case-study/voximplant-logo.svg'];
const copyMark = (asset, index) => {
  const original = prepareSvgAsset(readFileSync(new URL('../public/projects/' + asset, import.meta.url), 'utf8'), 'original-' + index);
  const attributes = { ...original.attributes, width: '32', height: '32', 'data-svg-src': '/projects/' + asset };
  return {
    original,
    attributes,
    innerHTML: original.body,
    get outerHTML() { return '<svg ' + Object.entries(this.attributes).map(([key, value]) => key + '="' + value + '"').join(' ') + '>' + this.innerHTML + '</svg>'; },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
};
const copiedMarks = logoAssets.map(copyMark);
const repeatedMarks = logoAssets.map(copyMark);
const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
// LAN previews do not expose crypto.randomUUID. This used to throw before
// dialog.showModal(), leaving the case URL changed and opening locked.
Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
try {
  assert.doesNotThrow(() => rescopeSvgAssets({ querySelectorAll: () => copiedMarks }), 'Opening works without crypto.randomUUID');
  assert.doesNotThrow(() => rescopeSvgAssets({ querySelectorAll: () => repeatedMarks }), 'Repeated opening also works on an HTTP network preview');
} finally {
  if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
  else delete globalThis.crypto;
}
const transitionIds = [...copiedMarks, ...repeatedMarks].flatMap(mark => ids(mark.innerHTML));
assert.equal(new Set(transitionIds).size, transitionIds.length, 'Repeated transition copies have unique definitions without cryptographic APIs');
for (const copied of [...copiedMarks, ...repeatedMarks]) {
  assert.equal(copied.attributes.width, '32');
  assert.equal(copied.attributes.height, '32');
  assert.ok(ids(copied.innerHTML).every(id => !ids(copied.original.body).includes(id)), 'Transition definitions have independent identifiers');
  const references = [...copied.innerHTML.matchAll(/url\(#([^)]*)\)/g)];
  assert.ok(references.length, 'The real logo retains its mask, gradient, filter or clip');
  for (const [, id] of references) assert.ok(ids(copied.innerHTML).includes(id), 'Every transition fragment resolves inside the copied SVG, even while the source is hidden');
  assert.equal([...copied.innerHTML.matchAll(/<(?:path|rect|circle|ellipse|polygon|polyline)\b/g)].length, [...copied.original.body.matchAll(/<(?:path|rect|circle|ellipse|polygon|polyline)\b/g)].length, 'The badge and its complete mark remain one unchanged vector');
}
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.ok(!/<img\b[^>]*\bsrc="[^"]+\.svg"/.test(home), 'Homepage marks render as actual inline SVG components');
assert.ok(home.includes('data-svg-src="/projects/voximplant-case-study/voximplant-logo.svg"'), 'Project cards and opened case templates share the SVG mark renderer');
const pipeline = readFileSync(new URL('../dist/case-studies/hooko/index.html', import.meta.url), 'utf8').match(/<ol class="hk-pipeline"[^>]*>([\s\S]*?)<\/ol>/)?.[1];
assert.equal([...pipeline.matchAll(/<li\b/g)].length, 6, 'Consolidating service marks preserves all six pipeline stages');
assert.equal([...pipeline.matchAll(/data-svg-src=/g)].length, 6, 'Each service badge shares its source with the tool cards');
console.log('PASS: genuine vector assets render through shared components; repeated logo gradients and clips resolve independently, and all six pipeline stages remain.');
