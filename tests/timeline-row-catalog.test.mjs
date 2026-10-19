import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateTimelineRow,validateTimelineWidth} from '../scripts/validate-timeline-row.mjs';
import {timelineUsage,timelineProps,timelineTokenGroups,timelineCards} from '../src/data/system-timeline.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
assert.deepEqual(validateTimelineRow(),[]);
const widthCSS=readFileSync('src/styles/design-system-timeline.css','utf8');
assert.deepEqual(validateTimelineWidth(widthCSS),[]);
assert(validateTimelineWidth(widthCSS.replace('.ds-timeline-stage > .ds-timeline-art','.ds-timeline-art')).length,'A generic specimen width must not override the native container cap');
assert(validateTimelineWidth(widthCSS.replace('calc(100vw - var(--gutter-left) - var(--gutter-right))','1200px')).length,'The width cap must follow website layout rules, not duplicate a literal');
const model=buildSystemInventory();
for(const [name,prop,type]of [['TimelineRow','item','Experience'],['ExperienceList','items','Experience[]']]){
 const component=model.components.find(c=>c.name===name),props=timelineProps(component);assert.equal(props[0].name,prop);assert.equal(props[0].type,type);assert.equal(props[0].default,'required');
 assert(timelineUsage(name).includes(`import ${name} from '../components/${name}.astro'`));
}
assert.deepEqual(timelineCards.map(c=>c.name),['Row','Timeline']);
assert.equal(timelineTokenGroups().find(g=>g.title==='Type').names.length,15);
const page=readFileSync('dist/design-system/index.html','utf8');for(const name of ['TimelineRow','ExperienceList'])assert(page.includes(`data-ds-usage="${name}"`));
assert(!page.includes('Static · scroll to read the full timeline'));
console.log('PASS Timeline source-derived page, required props, genuine examples and full direct type sets.');
