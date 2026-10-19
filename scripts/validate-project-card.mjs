import fs from'node:fs';import path from'node:path';
import {buildSystemInventory}from'../src/data/system-inventory.ts';
import {projectCardCards,projectCardStates,projectCardUsage,projectCardProps,projectCardTokenGroups,projectCardDescription}from'../src/data/system-project-card.ts';
import {compareTokenNames}from'../src/data/system-component-tokens.ts';
import {overviewHiddenComponents}from'../src/data/ds-components.ts';
import {missingUsageNames}from'./validate-button.mjs';
export function validateProjectCard(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],card=read('src/components/ProjectCard.astro'),work=read('src/components/WorkSection.astro'),page=read('src/components/DSProjectCards.astro'),specimen=read('src/components/DSProjectCardSpecimen.astro'),controller=read('src/scripts/design-system-project-card.ts'),shared=read('src/styles/design-system-button.css');
 if(/\blead\b|project--lead/.test(card+work))errors.push('ProjectCard must not retain the unused featured setting.');
 if(projectCardDescription!=='Each project in Work. The whole card opens its case study.'||projectCardCards.map(c=>c.id).join()!=='full,compact,identity'||projectCardStates.join()!=='Default,Hover,Focus')errors.push('Project card has the approved three variants and states.');
 if(/DSTokenNames|data-ds-names|ds-hint|ds-specs-card|data-ds-markup|ds-canvas/.test(page)||!page.includes('<DSTabs id="project-card-canvas"'))errors.push('Project card uses the common Preview/Code frame without obsolete panels.');
 for(const name of ['ProjectCard','ProjectIdentity','ProjectTags','IconButton'])if(!specimen.includes('<'+name))errors.push('Genuine project specimen missing: '+name);
 if(!specimen.includes("kind==='compact'?collectionProjects.find(project=>project.id==='yellow-leaf')"))errors.push('Compact specimen must be the real Yellow Leaf Websites card.');
 const styles=read('src/styles/design-system-project-card.css');
 if(!styles.includes('--project-rotate-x:calc(var(--project-tilt-angle) * -2deg)')||!styles.includes('--project-rotate-y:calc(var(--project-tilt-angle) * 2deg)'))errors.push('Frozen Hover must use twice the shared angle toward the bottom right.');
 if(!controller.includes('hover.offsetWidth*.8-button.offsetWidth/2')||!controller.includes('hover.offsetHeight*.78-button.offsetHeight/2'))errors.push('Real cursor must follow the frozen bottom-right pointer position.');
 if(!controller.includes('getComputedStyle(probe).width')||!controller.includes('gridTemplateColumns')||!controller.includes('getComputedStyle(fullDetails).width')||!controller.includes('Math.min(1,...items.map')||!controller.includes('freeze(sheet.cssRules)'))errors.push('Project fitting/state paint must derive from real layout and shared CSS.');
 if(!controller.includes("video.removeAttribute('data-project-video')")||!controller.includes('video.poster=video.dataset.poster')||!controller.includes("source.removeAttribute('data-src')"))errors.push('Catalog cards must show posters without playing videos.');
 if(!shared.includes('.ds-button-values dt { white-space:nowrap; flex:none; }')||!shared.includes('--ds-stage-clearance:var(--space-6)')||!shared.includes('--ds-stage-clearance:var(--space-4)')||!shared.includes('padding:var(--ds-stage-clearance)'))errors.push('One shared stage clearance and nowrap label rule owns every component page.');
 if(overviewHiddenComponents.map(item=>item.title).join()!=='Before and after,Decision card,Media,Steps')errors.push('Overview notes must omit parts documented on their parent pages.');
 const inventory=buildSystemInventory(root),props={ProjectCard:'project,compact',ProjectIdentity:'title,logo,logoBackground',ProjectTags:'tags'};
 for(const[name,order]of Object.entries(props)){const component=inventory.components.find(c=>c.name===name);if(projectCardProps(component).map(p=>p.name).join()!==order||projectCardProps(component).some(p=>!p.description))errors.push('Source props/order: '+name);if(missingUsageNames(projectCardUsage(name)).length)errors.push('Self-contained Usage: '+name);if(component.usages.some(u=>u.file.includes('/DS')))errors.push('Website-only Source consumers: '+name);}
 for(const group of projectCardTokenGroups())if(group.names.join()!==[...group.names].sort(compareTokenNames).join())errors.push('Natural project token order: '+group.title);
 const names=projectCardTokenGroups().flatMap(g=>g.names);for(const name of ['--project-tilt-angle','--project-tilt-perspective','--project-logo-size','--project-identity-tags-gap','--color-focus-ring'])if(!names.includes(name))errors.push('Direct project token missing: '+name);
 return errors;
}
