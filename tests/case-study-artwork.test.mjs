import assert from 'node:assert/strict';
import { borrowHeroImage, reserveHeroImage, restoreHeroImage } from '../src/scripts/case-study/case-study-artwork.ts';

class Node {
  constructor(tagName, properties = {}, children = []) {
    Object.assign(this, { tagName, dataset: {}, attrs: {}, children, parentElement: null }, properties);
    children.forEach(child => child.parentElement = this);
  }
  querySelector(tag) {
    return this.children.flatMap(child => [child, ...child.descendants()]).find(child => child.tagName.toLowerCase() === tag) ?? null;
  }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
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
const image = (src, alt) => new Node('IMG', { src, currentSrc: src, alt, loading: 'eager' });

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
console.log('PASS: the live image/picture survives opening, settling, closing and interruption; responsive layouts, reduced-motion sources, alt text and video ownership are preserved.');
