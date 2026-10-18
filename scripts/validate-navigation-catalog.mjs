import fs from 'node:fs';
import {compareTokenNames,componentTokenPatterns} from '../src/data/system-component-tokens.ts';
import {buttonTokenGroups} from '../src/data/system-button.ts';
import {chipTokenGroups} from '../src/data/system-chip.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {navigationGroups,navigationStates,navigationUsage,navigationProps,navigationTokenGroups} from '../src/data/system-navigation.ts';
import {chipConsumers} from '../src/data/system-chip.ts';
import {missingUsageNames} from './validate-button.mjs';
export function validateNavigationCatalog(root=process.cwd()){
 const read=file=>fs.readFileSync(root+'/'+file,'utf8'),errors=[],catalog=read('src/components/DSNavigationExamples.astro'),specimen=read('src/components/DSNavigationSpecimen.astro'),controller=read('src/scripts/design-system-navigation.ts'),css=read('src/styles/design-system-navigation.css'),global=read('src/styles/global.css');
 if(navigationGroups.flatMap(g=>g.cards.map(c=>c.id)).join(',')!=='top,floating,side,pill'||navigationStates.join(',')!=='Default,Hover,Focus,Selected')errors.push('Navigation has four components and one four-state row.');
 if(/DSTokenNames|data-ds-names|data-ds-markup|ds-hint|ds-specs-card/.test(catalog)||!catalog.includes('<DSTabs id="navigation-canvas"'))errors.push('Navigation uses left Preview/Code without obsolete catalog panels.');
 for(const tag of ['SiteHeader','SectionNavigation','Button'])if(!specimen.includes('<'+tag))errors.push('Navigation must compose '+tag);
 if(!controller.includes('pillGeometry(')||!controller.includes('freeze(sheet.cssRules)'))errors.push('Static placement and frozen states must read shared model/rules.');
 if(!css.includes('grid-template-columns:minmax(0,2fr) minmax(0,3fr)')||!css.includes('grid-template-rows:subgrid')||!read('src/styles/design-system-button.css').includes('white-space:nowrap'))errors.push('Navigation aligns its 2:3 cards and value labels.');
 if(!global.includes('var(--wordmark-baseline-outset)')||!global.includes('var(--text-body-m-strong) * -1'))errors.push('Header baseline uses source geometry and the shared text metric.');
 const model=buildSystemInventory(root),orders={NavigationItem:'label,href,filter,controls,pressed',SectionNavigation:'compact,theme,pill',LogoLink:'href,compact,morph'};
 for(const[name,order]of Object.entries(orders)){const component=model.components.find(c=>c.name===name);if(navigationProps(component).map(p=>p.name).join(',')!==order||navigationProps(component).some(p=>!p.description))errors.push('Source ordered props: '+name);if(missingUsageNames(navigationUsage(name)).length)errors.push('Self-contained usage: '+name);if(component.usages.some(u=>u.file.includes('/DS')))errors.push('Website Source list only: '+name);}
 if(chipConsumers(model.components.find(c=>c.name==='Chip')).some(file=>file.includes('/DS')))errors.push('Chip Source is website only.');
 const names=navigationTokenGroups().flatMap(g=>g.names);for(const token of ['duration-header-enter','duration-header-exit','ease-header-pill'])if(!names.includes('--'+token))errors.push('Navigation documents shared Work pill motion: '+token);
 if(!css.includes('padding:var(--space-16) var(--ds-stage-clearance)')||!css.includes('.ds-nav-specimen--top .site-header { height:var(--control-icon); }')||!css.includes('overflow:visible'))errors.push('Navigation centres the visible top row with token clearance and uncut shadows.');
 const navGroups=navigationTokenGroups();
 for(const [token,title] of [['--layer-header','Elevation'],['--header-clearance','Spacing'],['--header-inset','Spacing'],['--header-height','Size']])if(!navGroups.find(g=>g.title===title)?.names.includes(token))errors.push('Navigation token group: '+token);
 for(const groups of [navGroups,chipTokenGroups(),buttonTokenGroups(model.components.filter(c=>['Button','IconButton','TextLink'].includes(c.name)))]){
  for(const group of groups){if(group.names.join()!==[...group.names].sort(compareTokenNames).join())errors.push('Natural token order: '+group.title);for(const name of group.names){const key=group.title.startsWith('Type')?'type':group.title.toLowerCase();if(!componentTokenPatterns[key].test(name))errors.push('Direct token role: '+name);}}
 }
 return errors;
}
