import fs from'node:fs';import path from'node:path';
import {buildSystemInventory}from'../src/data/system-inventory.ts';
import {chipCards,chipProps,chipUsage,chipTokenGroups}from'../src/data/system-chip.ts';
import {missingUsageNames}from'./validate-button.mjs';
export function validateChip(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=[],chip=read('src/components/Chip.astro'),css=read('src/styles/global.css'),type=read('src/styles/typography.css'),catalog=read('src/components/DSChips.astro'),hero=read('src/components/Hero.astro');
 if(!chip.includes("variant?: 'default' | 'raised' | 'accent'")||!chip.includes("variant = 'default'")||/\bplain\b|\btag\b/.test(chip.replaceAll('skill-tag','skill').replaceAll('--tag-index','--index')))errors.push('Chip has exactly default, raised and accent.');
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const file of walk(path.join(root,'src')).filter(f=>f.endsWith('.astro')))if(/<Chip\b[^>]*variant=["'](?:tag|plain)["']/.test(fs.readFileSync(file,'utf8')))errors.push('Retired Chip variant in '+file);
 if(/<Chip|import Chip/.test(hero)||!hero.includes('process-tag text-label-s')||!read('src/scripts/hero-intro.ts').includes("querySelectorAll<HTMLElement>('.process-tag')"))errors.push('Plain hero words keep their own shared entrance.');
 const base=css.match(/\.skill-tag \{([^}]+)\}/)?.[1]||'';
 if(/(?:28|5|11)px/.test(base)||!base.includes('round(var(--text-label-s) * var(--line-height-label-s), var(--space-1)) + var(--space-3)')||!base.includes('padding: var(--space-1) calc(var(--space-3) - 1px)'))errors.push('Chip dimensions come from Label/S and Space1/3, with only border compensation.');
 if(css.includes(":root[data-theme='dark'] .skill-tag--accent"))errors.push('Accent retains its tint in both themes.');
 if((type.match(/\.text-caps-centred\s*\{/g)||[]).length!==1||!type.includes('text-box-trim: trim-both; text-box-edge: cap alphabetic;')||!chip.includes("'text-caps-centred'")||!read('src/components/DataGPTCaseStudy.astro').includes('<span class="text-caps-centred">{model.label}</span>'))errors.push('One shared capitals rule trims only Accent and model badge text.');
 for(const file of walk(path.join(root,'src/styles')).filter(f=>f.endsWith('.css')&&!f.endsWith('/typography.css')))if(/text-box-(?:trim|edge)\s*:/.test(fs.readFileSync(file,'utf8'))&&!file.endsWith('/design-system.css'))errors.push('Pill trimming belongs in typography.css: '+file);
 if(/DSTokenNames|data-ds-names|States|data-ds-markup/.test(catalog)||!catalog.includes('<DSTabs id="chip-canvas"'))errors.push('Chip has left Preview/Code tabs and no token switch, states or raw rendered markup.');
 if(chipCards.map(c=>c.variant).join(',')!=='default,raised,accent'||!catalog.includes('chipCards.map'))errors.push('Chip cards render all three real variants.');
 const model=buildSystemInventory(root).components.find(c=>c.name==='Chip'),props=chipProps(model);
 if(props.map(p=>p.name).join(',')!=='label,index,variant'||props.map(p=>p.default).join(',')!=="Required,0,'default'")errors.push('Chip Props follow the source contract.');
 if(missingUsageNames(chipUsage()).length||chipUsage().split('<Chip ').length!==4)errors.push('Usage must be self-contained and render each source variant.');
 if(chipTokenGroups().some(group=>!group.names.length))errors.push('Every direct Chip token group must be complete.');
 if(chipTokenGroups().map(g=>g.title).join('/')!=='Color/Type · Label/S/Spacing/Shape/Elevation/Motion')errors.push('Chip documents direct token groups only.');
 return errors;
}
