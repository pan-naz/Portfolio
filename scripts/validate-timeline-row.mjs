import fs from 'node:fs';import path from 'node:path';
import {timelineDescription,timelineCards,timelineUsage,timelineProps,timelineTokenGroups} from '../src/data/system-timeline.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {compareTokenNames} from '../src/data/system-component-tokens.ts';
import {missingUsageNames} from './validate-button.mjs';
/** The container-derived cap must outrank the generic full-width specimen rule. */
export function validateTimelineWidth(css){
 const rule=css.match(/\.ds-timeline-stage\s*>\s*\.ds-timeline-art\s*\{([^}]+)\}/)?.[1]||'';
 return rule.replace(/\s/g,'').includes('width:min(100%,calc(100vw-var(--gutter-left)-var(--gutter-right)));')?[]:['Timeline width must use the shared website gutters in a stage-scoped rule, never a copied pixel cap.'];
}
export function validateTimelineRow(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],page=read('src/components/DSTimeline.astro'),css=read('src/styles/design-system-timeline.css'),global=read('src/styles/global.css'),row=read('src/components/TimelineRow.astro'),list=read('src/components/ExperienceList.astro');
 if(timelineDescription!=='One role in the experience timeline.'||timelineCards.map(c=>c.id).join()!=='row,timeline')errors.push('Timeline row has the approved description and two cards.');
 if(/DSTokenNames|data-ds-names|ds-hint|ds-specs-card|data-ds-markup|ds-canvas|States/.test(page)||!page.includes('<DSTabs id="timeline-row-canvas"'))errors.push('Timeline uses the common Preview/Code frame only.');
 if(!page.includes('<TimelineRow item={experience[0]}/>')||!page.includes('<ExperienceList items={experience.slice(0,3)}/>')||!page.includes('data-color-zone="dark" inert aria-hidden="true"')||/transform:\s*scale|zoom:/.test(css))errors.push('Timeline specimens are genuine full-size, inert settled website content in the About dark zone.');
 errors.push(...validateTimelineWidth(css));
 if(!css.includes('grid-template-columns:minmax(0,1fr)')||!css.includes('var(--gutter-left) - var(--gutter-right)')||!css.includes('background:var(--color-bg-section)'))errors.push('Timeline cards stack and specimens use shared About layout and surface tokens.');
 if(read('src/components/DSPreview.astro').includes('TimelineRow')||read('src/data/system-presentation.ts').includes('TimelineRow:')||read('src/styles/design-system.css').includes('#timeline-row .ds-canvas'))errors.push('Retired Timeline composition/specs must be removed.');
 if((global.match(/--experience-duration-width: 80px/g)||[]).length!==1||(global.match(/var\(--experience-duration-width\)/g)||[]).length!==2)errors.push('One shared duration width supplies desktop and tablet.');
 const tablet=global.match(/@media \(min-width: 768px\) and \(max-width: 1327px\)\s*\{([\s\S]*?)\n\}/)?.[1];
 if(!tablet?.includes('grid-template-columns: 120px minmax(0,1fr) minmax(0,1.3fr) var(--experience-duration-width)')||!tablet.includes('.experience-duration { white-space: nowrap; }'))errors.push('Tablet duration uses the desktop 80px column and stays on one line.');
 if(!list.includes('aria-label="Experience timeline"')||!row.includes('<h3 class="text-body-m-strong">')||/<a |<button |tabindex=/.test(row))errors.push('Timeline retains ordered-list, role heading and noninteractive semantics.');
 const model=buildSystemInventory(root);for(const name of ['TimelineRow','ExperienceList']){
  const component=model.components.find(c=>c.name===name),usage=timelineUsage(name),props=timelineProps(component);
  if(missingUsageNames(usage).length||usage.split('\n').some(line=>line.length>80))errors.push(name+' Usage must be self-contained and at most 80 characters per line.');
  if(props.length!==1||props[0].default!=='required'||!props[0].description)errors.push(name+' documents its exact required source prop.');
  if(component.usages.some(u=>u.file.includes('/DS')))errors.push('Timeline Source must list website consumers only.');
 }
 const groups=timelineTokenGroups(),expected=['--color-border-default','--color-text-secondary',...['body-s','body-m-strong','body-m'].flatMap(role=>['font','font-weight','letter-spacing','line-height','text'].map(prefix=>`--${prefix}-${role}`)),'--space-2','--space-4','--space-6'];
 if(groups.flatMap(g=>g.names).sort().join()!==expected.sort().join()||groups.some(g=>g.names.some((n,i)=>i&&compareTokenNames(g.names[i-1],n)>=0)))errors.push('Timeline direct Color/Type/Spacing tokens are complete, source-derived and naturally sorted.');
 return errors;
}
