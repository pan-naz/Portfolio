import fs from 'node:fs';import path from 'node:path';
import {decisionCardProps,decisionCardTokens,decisionUsage,decisionLayout,decisionCardExamples} from '../src/data/system-decision-card.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {compareTokenNames} from '../src/data/system-component-tokens.ts';
import {missingUsageNames} from './validate-button.mjs';
export function validateDecisionCard(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],page=read('src/components/DSDecisionCards.astro'),css=read('src/styles/design-system-decision-card.css');
 for(const text of ['<CaseStudyDecisionCard','<CaseStudyMedia slot="media" {...figure.media} priority','voxText','voxImpact','hookoText','hookoImage','inert aria-hidden="true"','decisionLayout()','data-ds-component-code={component.name}'])if(!page.includes(text))errors.push('Missing genuine decision source: '+text);
 if(/DSTokenNames|ds-button-state|transform:\s*scale|zoom:/.test(page+css))errors.push('Decision specimens have no states, token switch or scaling.');
 if(decisionCardExamples.map(card=>card.id).join()!=='figure,stack,media')errors.push('Decision variants must be Figure, Card and With media.');
 const component=buildSystemInventory(root).components.find(c=>c.name==='CaseStudyDecisionCard');
 if(new Set(component.usages.map(u=>u.file)).size!==10||component.usages.some(u=>u.file.includes('/DS')))errors.push('Decision sources must be exactly ten website case studies.');
 if(decisionCardProps(component).map(p=>p.name).join()!=='title,titleHidden,label,labelVariant,layout')errors.push('Props retain their source order.');
 if(missingUsageNames(decisionUsage()).length||decisionUsage().split('\n').some(line=>line.length>80))errors.push('Self-contained Usage must fit 80 columns.');
 for(const group of decisionCardTokens())if(group.names.some((name,i)=>name.length>60||i&&compareTokenNames(group.names[i-1],name)>=0))errors.push('Direct tokens fit 60 columns and sort naturally.');
 if(!decisionLayout().includes('max-width: 1023px'))errors.push('Native widths must retain real project breakpoints.');
 const masonry=read('src/scripts/case-study/case-study-masonry.ts'),work=read('src/scripts/work-filter/work-filter.ts');
 if(!masonry.includes('layoutMasonry(this, cards, 2, \'alternate\', card => card.getBoundingClientRect().height)')||!work.includes('layoutMasonry(collection, cards, small.matches ? 1 : 2)'))errors.push('Blaustrom and Work must share placement with their existing reading orders.');
 return errors;
}
