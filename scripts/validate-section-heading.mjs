import fs from 'node:fs';import path from 'node:path';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {sectionHeadingCards,sectionHeadingDescription,sectionHeadingProps,sectionHeadingUsage,sectionHeadingTokenGroups} from '../src/data/system-section-heading.ts';
import {compareTokenNames} from '../src/data/system-component-tokens.ts';import {missingUsageNames} from './validate-button.mjs';
export function validateSectionHeading(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],component=read('src/components/SectionHeading.astro'),page=read('src/components/DSSectionHeadings.astro'),specimen=read('src/components/DSSectionHeadingSpecimen.astro'),walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 if(/ds-context-work|sample-work-title/.test(read('src/styles/global.css')+read('src/styles/design-system.css')))errors.push('Retired heading preview selectors must not remain.');
 if(!/\.work #work-title\s*\{\s*text-wrap: balance;\s*\}/.test(read('src/styles/global.css')))errors.push('Removing the old preview selector must preserve the live Work title balance rule.');
 if(/appearance/.test(component))errors.push('SectionHeading has no retired appearance branch or prop.');
 for(const file of walk(path.join(root,'src')).filter(f=>f.endsWith('.astro'))){const source=fs.readFileSync(file,'utf8');if(/<SectionHeading\b[^>]*appearance=/.test(source))errors.push('Retired SectionHeading appearance: '+file);if(/<p class="case-study-eyebrow">(?:(?!<\/p>)[\s\S])*<\/p>\s*<h2\b[^>]*class="case-study-heading"/.test(source))errors.push('Handwritten chapter pair: '+file);}
 if(sectionHeadingDescription!=='The label and title that open each section.'||sectionHeadingCards.map(c=>c.id).join()!=='columns,action,stacked')errors.push('Section heading has its approved description and three genuine compositions.');
 if(/States|DSTokenNames|data-ds-names|ds-hint|ds-specs-card|data-ds-markup|ds-canvas/.test(page)||!page.includes('<DSTabs id="section-heading-canvas"'))errors.push('Section heading uses only the shared Preview/Code card frame.');
 if(!specimen.includes('<SectionHeading')||!specimen.includes('reveal={false}')||!specimen.includes('<Button href={cvUrl}')||!page.includes('inert aria-hidden="true"'))errors.push('Catalog specimens must compose real inert, revealed headings and button.');
 const source=buildSystemInventory(root).components.find(c=>c.name==='SectionHeading'),props=sectionHeadingProps(source);
 if(props.map(p=>p.name).join()!=='id,label,reveal,layout'||props.some(p=>!p.description))errors.push('Section heading Props follow interface order and explain every input.');
 const usage=sectionHeadingUsage();if(missingUsageNames(usage).length||!usage.includes('id="impact-title"')||!usage.includes('id="hk-problem-h"'))errors.push('Usage must derive from actual self-contained Impact and Hooko calls.');
 if(source.usages.some(u=>u.file.includes('/DS')))errors.push('Section heading Source lists website consumers only.');
 for(const group of sectionHeadingTokenGroups())if(group.names.join()!==[...group.names].sort(compareTokenNames).join())errors.push('Natural direct-token order: '+group.title);
 const square=read('src/components/SquareCaseStudy.astro'),data=read('src/components/DataGPTCaseStudy.astro');if((square.match(/<h2 class="square-entry-title text-heading-xl"/g)||[]).length!==2||(data.match(/<p class="case-study-eyebrow dg-accent"/g)||[]).length!==2)errors.push('Four bespoke project headings remain outside consolidation.');
 return errors;
}
