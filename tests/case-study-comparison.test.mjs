import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync('src/components/CaseStudyComparison.astro','utf8');
const makeNode=(state,image=false)=>{
  const attrs=new Map(image?[['aria-hidden',String(state!=='after')]]:[['aria-pressed',String(state==='after')]]);
  const classes=new Set([state==='after'?'button--primary':'button--secondary']);
  return {dataset:image?{comparisonImage:state}:{comparisonChoice:state},textContent:state==='after'?'After':'Before',attrs,classes,
    getAttribute:n=>attrs.get(n),setAttribute:(n,v)=>attrs.set(n,v),toggleAttribute:(n,on)=>on?attrs.set(n,''):attrs.delete(n),
    classList:{toggle:(n,on)=>on?classes.add(n):classes.delete(n)},closest(){return this;}};
};
globalThis.HTMLElement=class {
  constructor(){this.buttons=['before','after'].map(s=>makeNode(s));this.images=['before','after'].map(s=>makeNode(s,true));this.status={textContent:'Showing After'};this.listeners=[];}
  contains(node){return this.buttons.includes(node);}
  addEventListener(name,fn,options){this.listeners.push({name,fn,...options});}
  querySelectorAll(selector){return selector==='[data-comparison-choice]'?this.buttons:this.images;}
  querySelector(selector){return selector==='[data-comparison-status]'?this.status:this.buttons.find(b=>selector.includes(`"${b.dataset.comparisonChoice}"`));}
};
const registry=new Map();globalThis.customElements={get:n=>registry.get(n),define:(n,c)=>registry.set(n,c)};
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const js=ts.transpileModule(script,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const comparison=new (registry.get('case-study-comparison'))();comparison.connectedCallback();
comparison.select('after');assert.equal(comparison.status.textContent,'Showing After');
comparison.select('before');assert.equal(comparison.buttons[0].getAttribute('aria-pressed'),'true');assert.equal(comparison.buttons[1].getAttribute('aria-pressed'),'false');
assert.ok(comparison.buttons[0].classes.has('button--primary'));assert.ok(comparison.buttons[1].classes.has('button--secondary'));
assert.equal(comparison.images[0].getAttribute('aria-hidden'),'false');assert.equal(comparison.images[1].getAttribute('aria-hidden'),'true');assert.equal(comparison.status.textContent,'Showing Before');
let writes=0;const set=comparison.buttons[0].setAttribute;comparison.buttons[0].setAttribute=(...args)=>{writes++;set(...args);};
comparison.select('before');assert.equal(writes,0,'Selecting the active state changes nothing');
let selections=0;const select=comparison.select;comparison.select=function(value){selections++;select.call(this,value);};
comparison.listeners[0].fn({target:comparison.buttons[1]});assert.equal(selections,1,'Manual taps use the same public method');assert.equal(comparison.status.textContent,'Showing After');
comparison.disconnectedCallback();assert.ok(comparison.listeners[0].signal.aborted);
assert.match(source,/<case-study-comparison id=\{id\}/);
console.log('PASS: shared select path, no-op selection, pressed/image/status semantics and lifecycle cleanup.');
