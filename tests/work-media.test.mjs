import assert from 'node:assert/strict';
globalThis.matchMedia = () => ({ matches: false });
import { initializeWorkMedia } from '../src/scripts/work-filter/work-media.ts';
import { preloadCaseVideo } from '../src/scripts/case-study/case-study-videos.ts';
const tasks=[],images=[],events=[];
const tick=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
globalThis.window=new EventTarget();
window.scheduler={postTask(fn,options){let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});tasks.push({options,run(){if(!options.signal.aborted)fn();resolve();}});return promise;}};
globalThis.document=Object.assign(new EventTarget(),{hidden:false,fonts:{ready:Promise.resolve()}});
globalThis.location={pathname:'/'};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection:{effectiveType:'4g',saveData:false}}});
globalThis.Image=class{constructor(){this.promise=new Promise(resolve=>{this.resolve=resolve});images.push(this);}set src(value){this.url=value;events.push(`poster:${value}`);}decode(){return this.promise;}};
const movie=name=>{const source={dataset:{src:`/${name}.mp4`},hasAttribute:()=>source.src!==undefined};return {dataset:{poster:`/${name}.jpg`},poster:'',preload:'none',currentTime:24,muted:false,loads:0,plays:0,pauses:0,closest:()=>null,querySelectorAll:s=>s==='source[data-src]'?[source]:[],source,load(){this.loads++;events.push(`buffer:${name}:${this.preload}`);},play(){this.plays++;},pause(){this.pauses++;}};};
const collection=(name,count=4)=>({dataset:{projectCollection:name},hidden:name!=='selected',videos:Array.from({length:count},(_,i)=>movie(`${name}-${i}`)),querySelectorAll(){return this.videos.map(v=>({querySelector:()=>v}));}});
const selected=collection('selected'),websites=collection('websites'),misc=collection('misc');
const list={dataset:{activeFilter:'selected'}};
const work=Object.assign(new EventTarget(),{querySelector:()=>list,querySelectorAll:()=>[selected,websites,misc]});document.querySelector=()=>work;
let start;const controller=initializeWorkMedia(new Promise(resolve=>{start=resolve}));
work.dispatchEvent(new Event('workfilterchange'));await tick();assert.equal(tasks.length,0);assert.equal(images.length,0,'Nothing starts before the intro');
start();await tick();assert.equal(tasks.length,1);assert.equal(tasks[0].options.priority,'background');tasks[0].run();await tick();assert.equal(images.length,1);assert.equal(images[0].fetchPriority,'low');assert.equal(selected.videos[0].source.src,undefined,'All posters precede buffering');
for(let i=0;i<3;i++){assert.equal(images[i].url,`/selected-${i}.jpg`);assert.equal(images[i].fetchPriority,'low');images[i].resolve();await tick();}
assert.deepEqual(selected.videos.map(v=>v.preload),['auto','metadata','metadata','none']);assert.deepEqual(selected.videos.map(v=>v.loads),[1,1,1,0]);assert.ok([...selected.videos,...websites.videos,...misc.videos].every(v=>v.plays===0&&v.pauses===0&&v.currentTime===24&&v.muted===false),'Buffering must not play/pause, seek or change sound');assert.ok(websites.videos.every(v=>!v.source.src));assert.ok(misc.videos.every(v=>!v.source.src));
assert.deepEqual(events.slice(-3),['buffer:selected-0:auto','buffer:selected-1:metadata','buffer:selected-2:metadata']);
preloadCaseVideo(selected.videos[0],'metadata');preloadCaseVideo(selected.videos[0],'auto');assert.equal(selected.videos[0].loads,1,'Existing source/buffer never reloads');assert.equal(selected.videos[0].preload,'auto','Metadata request cannot downgrade an already buffering first video');
// The real filter event precedes its synchronous DOM update; the deferred task
// must read the new selection and stop after a switch during poster decoding.
work.dispatchEvent(new Event('workfilterchange'));selected.hidden=true;websites.hidden=false;list.dataset.activeFilter='websites';tasks.at(-1).run();await tick();const oldImage=images.at(-1);assert.equal(oldImage.url,'/websites-0.jpg');
work.dispatchEvent(new Event('workfilterchange'));websites.hidden=true;misc.hidden=false;list.dataset.activeFilter='misc';oldImage.resolve();await tick();assert.ok(websites.videos.every(v=>!v.source.src));assert.ok(!images.some(i=>i.url==='/websites-1.jpg'),'A superseded filter cannot continue preparing');
tasks.at(-1).run();await tick();assert.equal(images.at(-1).url,'/misc-0.jpg');controller.destroy();images.at(-1).resolve();await tick();assert.ok(misc.videos.every(v=>!v.source.src));const taskCount=tasks.length;work.dispatchEvent(new Event('workfilterchange'));document.dispatchEvent(new Event('visibilitychange'));await tick();assert.equal(tasks.length,taskCount,'Destroyed listeners and queued callbacks cannot revive work');
for(const connection of [{saveData:true,effectiveType:'4g'},{saveData:false,effectiveType:'2g'},{saveData:false,effectiveType:'slow-2g'}]){navigator.connection=connection;const count=tasks.length,requests=images.length;const c=initializeWorkMedia(Promise.resolve());await tick();work.dispatchEvent(new Event('workfilterchange'));await tick();assert.equal(tasks.length,count);assert.equal(images.length,requests);c.destroy();}
navigator.connection={saveData:false,effectiveType:'4g'};document.hidden=true;const hidden=initializeWorkMedia(Promise.resolve());await tick();assert.equal(tasks.length,taskCount);document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));await tick();assert.equal(tasks.length,taskCount+1);hidden.destroy();tasks.at(-1).run();await tick();assert.ok(misc.videos.every(v=>!v.source.src));
console.log('PASS: intro/font ordering, low priority, exactly three active cards, opt-outs, no playback mutation, stale-filter races and teardown.');
