import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeWorkFilterPill } from '../src/scripts/work-filter/work-filter-pill.ts';
import { pillDuration, pillExitDuration } from '../src/scripts/header-morph/header-morph-model.ts';

let width=390, top=300, bottom=3000, reads=0, serial=0, observers=0;
const frames=new Map();
const nav={dataset:{},style:{maxWidth:''},removeAttribute(){delete this.dataset.themeFit;},getBoundingClientRect(){reads++;return {width:width<=380?319.84375:344.40625};}};
const wrapper={dataset:{},inert:true,setAttribute(name,value){this[name]=value;},querySelector(){return nav;}};
const panel={getBoundingClientRect(){reads++;return {top};}};
const section=Object.assign(new EventTarget(),{querySelector:selector=>selector==='.work-panel'?panel:wrapper,getBoundingClientRect:()=>({bottom})});
const root={dataset:{},append(){}};
let safeLeft=0,safeRight=0;
globalThis.window=new EventTarget();
Object.defineProperty(globalThis,'innerWidth',{get:()=>width});
globalThis.document=Object.assign(new EventTarget(),{documentElement:root,createElement:()=>({style:{},remove(){}}),querySelector:()=>section,fonts:{ready:Promise.resolve()}});
globalThis.getComputedStyle=()=>({paddingLeft:`${safeLeft}px`,paddingRight:`${safeRight}px`,paddingTop:'0px',paddingBottom:'0px',getPropertyValue:()=> '16px'});
globalThis.requestAnimationFrame=callback=>{frames.set(++serial,callback);return serial;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
globalThis.ResizeObserver=class{observe(){observers++;}disconnect(){observers--;}};
const flush=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());};
const pill=initializeWorkFilterPill();await Promise.resolve();
assert.equal(wrapper.dataset.visible,'false');assert.equal(wrapper.inert,true);assert.equal(wrapper['aria-hidden'],'true');
section.dispatchEvent(new Event('focusin'));
assert.equal(wrapper.dataset.visible,'false','Programmatic dialog return focus is not a new Tab entry');
for(width of [320,351,352,360,390,820]){window.dispatchEvent(new Event('resize'));assert.equal(nav.dataset.themeFit,String(width>=352));}
width=390;safeLeft=safeRight=47;window.dispatchEvent(new Event('resize'));assert.equal(nav.dataset.themeFit,'false','Safe gutters participate in the measured theme fit');safeLeft=safeRight=0;
top=0;window.dispatchEvent(new Event('scroll'));flush();
assert.equal(wrapper.dataset.visible,'true','The dark edge, not the former bar, triggers the pill');
assert.equal(wrapper.inert,false);assert.equal(wrapper['aria-hidden'],'false');
bottom=0;window.dispatchEvent(new Event('scroll'));flush();assert.equal(wrapper.dataset.visible,'false');assert.equal(wrapper.inert,true);
bottom=1000;window.dispatchEvent(new Event('scroll'));flush();assert.equal(wrapper.dataset.visible,'true');
top=1;window.dispatchEvent(new Event('scroll'));flush();assert.equal(wrapper.dataset.visible,'false');
root.dataset.workStageLayout='true';window.dispatchEvent(new Event('workstagelayoutchange'));const desktopReads=reads;
for(let i=0;i<100;i++)window.dispatchEvent(new Event('scroll'));
assert.equal(frames.size,0);assert.equal(reads,desktopReads,'No compact pill work on floating desktop');
delete root.dataset.workStageLayout;top=-100;window.dispatchEvent(new Event('workstagelayoutchange'));assert.equal(wrapper.dataset.visible,'true');
window.dispatchEvent(new Event('scroll'));pill.destroy();assert.equal(frames.size,0);assert.equal(observers,0);assert.equal(wrapper.inert,true);
window.dispatchEvent(new Event('scroll'));assert.equal(frames.size,0);
const css=readFileSync(new URL('../src/styles/tokens.css',import.meta.url),'utf8');
assert.ok(css.includes(`--duration-header-enter: ${pillDuration}ms`));assert.ok(css.includes(`--duration-header-exit: ${pillExitDuration}ms`));
// Bezier x(t)=t for controls at 1/3 and 2/3; y(t) exactly equals the
// desktop's existing smooth(t), rather than introducing another motion curve.
assert.ok(css.includes('--ease-header-pill: cubic-bezier(.3333333333333333, 0, .6666666666666666, 1)'));
for(let t=0;t<=1;t+=.01)assert.ok(Math.abs(3*(1-t)*t*t+t*t*t-t*t*(3-2*t))<1e-12);
console.log('PASS: dark-edge lifecycle, inert/ARIA, exact fit, desktop idle, cleanup and shared header motion values');
