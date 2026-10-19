import fs from 'node:fs';import path from 'node:path';
import {toolCardDescription,toolCardGroups,toolCardUsage,toolCardProps,toolCardTokenGroups,toolDetailLayout} from '../src/data/system-tool-card.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {compareTokenNames} from '../src/data/system-component-tokens.ts';
import {missingUsageNames} from './validate-button.mjs';
/** The page composes genuine components; it never adds website variants or artwork copies. */
export function validateToolCardTooltip(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],page=read('src/components/DSToolCards.astro'),css=read('src/styles/design-system-tool-card.css'),controller=read('src/scripts/design-system-tool-card.ts');
 if(toolCardDescription!=='Two components: the tool card, and the tooltip that shows its name.'||toolCardGroups.map(group=>group.title).join()!=='Tool card,Tooltip'||toolCardGroups.flatMap(group=>group.cards.map(card=>card.id)).join()!=='logo,detail,above,below,focus')errors.push('Tool card & Tooltip requires the two approved groups and five examples.');
 for(const part of ['id="tooltip"','<ToolCard tool={detail} variant="detail"','<ToolCard tool={logo}','<DSTabs id="tooltip-canvas"','data-ds-component-code={component.name}','inert aria-hidden="true"'])if(!page.includes(part))errors.push('Missing genuine Tool card / Tooltip page part: '+part);
 if(/ds-canvas|ds-specs-card|DSTokenNames|data-ds-tooltip-state|<svg|<path/.test(page)||/transform:\s*scale|zoom:/.test(css))errors.push('Retired Tooltip canvas and scaling cannot return.');
 if(!page.includes('hookoTools.find')||!page.includes('toolDetailLayout()')||!page.includes('class="tools-grid"')||!controller.includes('getBoundingClientRect().width'))errors.push('Specimen widths and content must come from the real About grid and Hooko stack.');
 if(!controller.includes('rule.style.cssText')||!controller.includes('data-tooltip-visible')||!controller.includes("tooltip.dataset.placement=state==='below'?'below':'above'"))errors.push('Frozen states must read genuine website CSS and Tooltip attributes.');
 const layout=toolDetailLayout();for(const part of ['repeat(3, minmax(0, 1fr))','max-width: 1023px','repeat(2, minmax(0, 1fr))','max-width: 560px','grid-template-columns: 1fr'])if(!layout.includes(part))errors.push('Hooko width probe omitted a real layout rule: '+part);
 if(/355px|padding-inline:var\(--space-3\)/.test(css))errors.push('Tool card & Tooltip uses the shared phone inset, without a page-specific compact exception.');
 const model=buildSystemInventory(root);for(const name of ['ToolCard','Tooltip']){
  const component=model.components.find(component=>component.name===name),props=toolCardProps(component),usage=toolCardUsage(name);
  if(missingUsageNames(usage).length||usage.split('\n').some(line=>line.length>80))errors.push(name+' Usage must define every name and fit 80 columns.');
  if(props.some(prop=>!prop.description)||props.map(prop=>prop.name).join()!==component.props.map(prop=>prop.name).join())errors.push(name+' props must retain source order and descriptions.');
  if(component.usages.some(usage=>usage.file.includes('/DS')))errors.push('Source lists only real website consumers.');
 }
 const groups=toolCardTokenGroups();if(groups.some(group=>group.names.some((name,index)=>name.length>60||index&&compareTokenNames(group.names[index-1],name)>=0)))errors.push('Direct token names must be naturally sorted and fit 60 columns.');
 for(const role of ['label-m','body-m-strong','body-m'])for(const prefix of ['font','font-weight','text','line-height','letter-spacing'])if(!groups.flatMap(group=>group.names).includes(`--${prefix}-${role}`))errors.push('Missing direct text style token '+prefix+'-'+role);
 for(const retired of ['src/components/DSComponent.astro','src/components/DSPreview.astro','src/data/system-presentation.ts'])if(fs.existsSync(path.join(root,retired)))errors.push('Unused Tooltip-only composition remains: '+retired);
 return errors;
}
