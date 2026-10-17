import assert from 'node:assert/strict';
import { prepareHeroImage, borrowHeroImage, reserveHeroImage, restoreHeroImage } from '../src/scripts/case-study/case-study-artwork.ts';

class Node {
  constructor(tagName, properties = {}, children = []) {
    Object.assign(this, { tagName, dataset: {}, attrs: {}, children, parentElement: null }, properties);
    children.forEach(child => child.parentElement = this);
  }
  contains(node) { return this === node || this.descendants().includes(node); }
  querySelector(tag) {
    return this.children.flatMap(child => [child, ...child.descendants()]).find(child => child.tagName.toLowerCase() === tag.split(' ').at(-1)) ?? null;
  }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  get attributes() { return Object.entries(this.attrs).map(([name,value])=>({name,value})); }
  querySelectorAll(selector) { return this.descendants().filter(child => selector.split(',').some(tag => child.tagName.toLowerCase() === tag.trim().split('[')[0] && (!tag.includes('[') || child.getAttribute('srcset')))); }
  getAttribute(name) { return this.attrs[name] ?? this[name] ?? null; }
  removeAttribute(name) { delete this.attrs[name]; delete this[name]; }
  setAttribute(name, value) { this.attrs[name] = value; }
  cloneNode() {
    const { children, parentElement, ...properties } = this;
    return new Node(this.tagName, { ...properties, dataset: { ...this.dataset }, attrs: { ...this.attrs } }, children.map(child => child.cloneNode()));
  }
  replaceWith(node) {
    assert.ok(this.parentElement);
    if (node.parentElement) node.parentElement.children.splice(node.parentElement.children.indexOf(node), 1);
    const parent = this.parentElement;
    parent.children[parent.children.indexOf(this)] = node;
    node.parentElement = parent;
    this.parentElement = null;
  }
}
globalThis.document = { createElement: () => ({content:{ownerDocument:{importNode:node=>node.cloneNode(true)}}}) };
const image = (src, alt) => new Node('IMG', { src, currentSrc: src, clientWidth: 540, alt, loading: 'eager' });

for (const picture of [true, false]) for (const interrupted of [true, false]) {
  const live = image('hero.webp', 'Card artwork');
  const source = new Node('SOURCE', { media: '(prefers-reduced-motion: reduce)', srcset: 'still.webp' });
  const node = picture ? new Node('PICTURE', {}, [source, live]) : live;
  const card = new Node('DIV', {}, [node]);
  const caseImage = image('hero.webp', 'Case artwork');
  const hero = new Node('FIGURE', {}, [picture ? new Node('PICTURE', {}, [new Node('SOURCE'), caseImage]) : caseImage]);
  const borrowed = borrowHeroImage(card, hero);
  assert.equal(borrowed.image, live, 'The card supplies its actual live image, preserving decoded animation state');
  assert.equal(hero.querySelector('img'), live);
  assert.notEqual(card.querySelector('img'), live, 'A layout-preserving clone reserves the card geometry');
  assert.equal(borrowed.placeholder.attrs['aria-hidden'], 'true');
  const outward = reserveHeroImage(live);
  const travel = new Node('DIV', {}, [outward.node]);
  assert.equal(travel.querySelector('img'), live);
  if (picture) assert.equal(travel.querySelector('source'), source, 'Reduced-motion source selection travels with the live picture');
  if (!interrupted) {
    restoreHeroImage(outward);
    assert.equal(hero.querySelector('img'), live, 'Opening settles the same image rather than replacing it with a fresh animation');
    const returning = reserveHeroImage(live);
    new Node('DIV', {}, [returning.node]);
  }
  restoreHeroImage(borrowed);
  assert.equal(card.querySelector('img'), live, 'Closing returns the same animated image to its original card');
  assert.equal(live.alt, 'Card artwork', 'The card accessible text is restored');
  assert.equal(card.children.length, 1);
}

const distinct = new Node('DIV', {}, [image('card-800.webp', '')]);
const hero = new Node('FIGURE', {}, [image('hero-1800.webp', '')]);
assert.equal(borrowHeroImage(distinct, hero), undefined, 'Different responsive assets retain their correct destination image');
assert.equal(distinct.children.length, 1);
const video = new Node('DIV', {}, [new Node('VIDEO', {}, [image('poster.webp', '')])]);
assert.equal(borrowHeroImage(video, hero), undefined, 'The existing live-video handoff keeps ownership of its poster and recording');
globalThis.innerWidth = 1440;
const responsive = image('/projects/still.jpg', 'Card still');
responsive.currentSrc = '/generated/images/still-640.avif';
const responsiveSource = new Node('SOURCE', { srcset: '/generated/images/still-640.avif 640w, /generated/images/still-1920.avif 1920w' });
const responsiveCard = new Node('DIV', {}, [new Node('PICTURE', {}, [responsiveSource, responsive])]);
const responsiveHero = new Node('DIV', {}, [image('/projects/still.jpg', 'Case still')]);
const responsiveTransfer = borrowHeroImage(responsiveCard, responsiveHero);
assert.equal(responsiveTransfer.image, responsive, 'Different responsive candidates of one original reuse the decoded card image');
assert.equal(responsive.attrs.srcset, responsive.currentSrc + ' 640w', 'The decoded responsive candidate stays pinned through the transfer');
for (const node of [responsiveTransfer.placeholder, ...responsiveTransfer.placeholder.descendants()]) {
  assert.equal(node.getAttribute('src'), null, 'Reservations never download another image');
  assert.equal(node.getAttribute('srcset'), null);
}
restoreHeroImage(responsiveTransfer);
assert.equal(responsive.attrs.srcset, responsive.currentSrc + ' 640w', 'The returned card keeps the clicked candidate even with a larger hero in cache');
globalThis.innerWidth = 1280;
responsiveTransfer.release();
assert.equal(responsive.getAttribute('srcset'), null, 'A resized card regains normal responsive selection');
assert.match(responsiveSource.getAttribute('srcset'), /1920/);
// An inert template resolves src differently; asset identity comes from its attribute.
const inertCardImage = image('https://site.test/hero.jpg', 'Card');
inertCardImage.attrs.src = '/hero.jpg';
const inertHeroImage = image('/hero.jpg', 'Hero');
inertHeroImage.attrs.src = '/hero.jpg';
assert.ok(borrowHeroImage(new Node('DIV',{},[inertCardImage]), new Node('DIV',{},[inertHeroImage])));
const requests = [];
globalThis.innerWidth = 1024;
globalThis.devicePixelRatio = 1;
globalThis.Image = class extends Node { constructor(){super('IMG');} set src(url){this.url=url;requests.push(url);} get src(){return this.url;} };
const largeSource = new Node('SOURCE', {type:'image/avif',srcset:'/hero-640.avif 640w, /hero-1280.avif 1280w, /hero-1920.avif 1920w'});
const largeOriginal = image('/hero.jpg','Hero');
const preparedTemplate = {content:new Node('DIV',{},[new Node('PICTURE',{},[largeSource,largeOriginal])])};
const displayed = image('/hero.jpg','Card');displayed.currentSrc='/hero-640.avif';
const previewCard = new Node('DIV',{},[displayed]);
const pending = prepareHeroImage(preparedTemplate,previewCard);
assert.equal(pending,prepareHeroImage(preparedTemplate,previewCard),'Repeated hover, focus and press share one preparation');
assert.deepEqual(requests,['/hero-1280.avif'],'Only one required-size file loads; no fallback original or parallel responsive copy');
console.log('PASS: the live image/picture survives opening, settling, closing and interruption; responsive layouts, reduced-motion sources, alt text and video ownership are preserved.');
