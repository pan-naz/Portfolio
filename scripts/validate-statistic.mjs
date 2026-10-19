import fs from 'node:fs';import path from 'node:path';
import {statisticDescription,statisticCards,statisticExamples,statisticNumber,statisticUsage,statisticProps,statisticTokenGroups} from '../src/data/system-statistic.ts';
import {compareTokenNames} from '../src/data/system-component-tokens.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {missingUsageNames} from './validate-button.mjs';
export function validateStatistic(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],page=read('src/components/DSStatistics.astro'),specimen=read('src/components/DSStatisticSpecimen.astro'),css=read('src/styles/design-system-statistic.css'),stat=read('src/components/Stat.astro');
 if(statisticDescription!=='A result with its label and an optional note.'||statisticCards.map(c=>c.id).join()!=='default,case,bare,number')errors.push('Statistic has its exact four approved cards and description.');
 if(statisticExamples.default.value!=='$1.5M'||statisticExamples.case.value!=='≈87%'||statisticExamples.bare.value!=='30+'||statisticNumber!=='10+')errors.push('Statistic specimens must read the actual website results.');
 if(!/note\?: string/.test(stat)||!stat.includes('{note && <dd')||read('src/styles/datagpt-case-study.css').includes('dd:empty')||/note:\s*''/.test(read('src/components/DataGPTCaseStudy.astro')+read('src/data/datagpt-case-study.ts')))errors.push('Stat omits absent/empty notes; DataGPT needs no empty-note markup or style.');
 if(/DSTokenNames|data-ds-names|data-ds-markup|States/.test(page)||!page.includes('<DSTabs id="statistic-canvas"'))errors.push('Statistic uses only the shared component-page Preview/Code frame, no states or token switch.');
 if(!specimen.includes('<Stat {...statisticExamples[kind]}/>')||!specimen.includes('<MetricValue value={statisticNumber} as="strong"/>')||/revealValue|reveal=/.test(specimen)||!page.includes('inert aria-hidden="true"'))errors.push('Statistic composes settled inert Stat/MetricValue examples.');
 if(!css.includes('grid-template-columns:repeat(2,minmax(0,1fr))')||!css.includes('grid-template-rows:subgrid')||!css.includes('width:min(100%,var(--ds-stat-width))')||/transform:scale/.test(css))errors.push('Statistic uses full-size, width-limited specimens and aligned two-column cards.');
 const model=buildSystemInventory(root);
 for(const name of ['Stat','MetricValue']){
  const component=model.components.find(c=>c.name===name),props=statisticProps(component),expected=name==='Stat'?['value','label','note','revealValue']:['value','as','class','reveal'];
  if(props.map(p=>p.name).join()!==expected.join()||props.some(p=>!p.description))errors.push(name+' Props must follow source order with exact descriptions.');
  const usage=statisticUsage(name);if(missingUsageNames(usage).length||usage.split('\n').some(line=>line.length>80)||/\.\.\./.test(usage))errors.push(name+' Usage must be self-contained with written-out props and ≤80-character lines.');
  if(component.usages.some(u=>u.file.includes('/DS')))errors.push(name+' Source lists website consumers only.');
 }
 const expected=['--color-border-default','--color-interactive-accent','--color-text-secondary',...['heading-l','body-m-strong','body-m','body-s'].flatMap(role=>['font','font-weight','letter-spacing','line-height','text'].map(prefix=>`--${prefix}-${role}`)),'--space-1','--space-4','--distance-title-reveal','--duration-title-reveal','--ease-entrance','--stagger-title-reveal'].sort();
 if(statisticTokenGroups().flatMap(g=>g.names).sort().join()!==expected.join())errors.push('Statistic direct Color/Type/Spacing/Motion tokens must follow the shared source.');
 const groups=statisticTokenGroups(),tokenCode=groups.map(group=>`/* ${group.title} */\n`+group.names.join('\n')).join('\n\n');
 if(!page.includes("tokenCode=groups.map(group=>`/* ${group.title} */\\n`+group.names.join('\\n')).join('\\n\\n')")||groups.some(group=>group.names.some((name,index)=>index>0&&compareTokenNames(group.names[index-1],name)>=0)))errors.push('Statistic uses the common group-comment, naturally sorted names-only token format.');
 if(tokenCode.split('\n').some(line=>line.length>60))errors.push('Statistic half-width token lines must be ≤60 characters.');
 return errors;
}
