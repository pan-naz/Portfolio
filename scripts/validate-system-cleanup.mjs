import fs from'node:fs';import path from'node:path';
const declarations=(source,selector)=>{const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),body=source.match(new RegExp(escaped+'\\s*\\{([^}]+)\\}'))?.[1]||'';return Object.fromEntries(body.split(';').filter(part=>part.includes(':')).map(part=>{const i=part.indexOf(':');return[part.slice(0,i).trim(),part.slice(i+1).trim()];}));};
export function validateAccentMixes(source,file='fixture.css'){
 return file.endsWith('tokens.css')?[]:[...source.matchAll(/color-mix\([^;{}]+/g)].filter(([value])=>value.includes('--color-interactive-accent')).map(()=>`Accent tint must use its shared role: ${file}`);
}
export function validateLogoLinks(sources){
 const errors=[];for(const[file,source]of Object.entries(sources))if(file!=='src/components/LogoLink.astro'&&/<a\b[^>]*aria-label="naz\.wtf — home"/.test(source))errors.push('Home link must compose LogoLink: '+file);
 const link=sources['src/components/LogoLink.astro']||'';if(!link.includes('aria-label="naz.wtf — home"')||!link.includes('<Logo compact={compact}')||!link.includes('header-full-logo')||!link.includes('header-compact-logo')||/<script|<style/.test(link))errors.push('LogoLink must compose original full/compact/header geometry and shared styles without private motion.');
 for(const[file,count]of[['SiteHeader',1],['DSNavigation',1],['DSPreview',3]])if((sources['src/components/'+file+'.astro']?.match(/<LogoLink\b/g)||[]).length!==count)errors.push('Every existing home-link variant must use LogoLink: '+file);
 return errors;
}
/** Catalog emphasis uses a solid edge, never a second tint. */
export function validateCatalogAccentEdges(spacing,motion){
 const errors=[];
 for(const[source,selector,edge]of[[spacing,'.ds-spacing-tile::before','border-inline'],[motion,'.ds-motion-project [data-motion-caption]','border-top']]){const rule=declarations(source,selector);if(rule.background!=='var(--color-bg-accent-subtle)'||rule[edge]!=='1px solid var(--color-interactive-accent)')errors.push('Catalog emphasis must keep the shared tint and solid accent edge: '+selector);}
 return errors;
}
export function validateProjectDemo(motion){
 const panel=declarations(motion,'.ds-motion-project [data-motion-panel]'),parts=declarations(motion,'.ds-motion-project span'),errors=[];
 if(panel.background!=='none'||panel['z-index']!=='var(--layer-content)'||parts.border!=='1px solid var(--color-interactive-accent)')errors.push('Project demo keeps a transparent accent outline above its caption.');
 if(parts.background!=='var(--color-bg-accent-subtle)')errors.push('Project demo artwork keeps the shared accent tint.');
 return errors;
}
export function validateDataGPTBadges(css){
 const errors=[],badge=declarations(css,'.dg-badge');
 if(badge.padding!=='var(--space-1) var(--space-3)'||badge['white-space']!=='nowrap')errors.push('DataGPT badges use intrinsic single-line Label/S with Space1/Space3 padding.');
 if(/--dg-(?:question|answer)-label-advance|--dg-badge-(?:block|inline)-inset/.test(css))errors.push('DataGPT badges cannot retain measured text advances or padding aliases.');
 for(const rule of css.matchAll(/[^{}]*\.dg-badge[^{}]*\{([^}]+)\}/g))if(/(?:^|;)\s*(?:(?:min|max)-)?(?:width|height|inline-size|block-size)\s*:/.test(rule[1].replace('min-height: calc(1lh + var(--space-1) * 2);','')))errors.push('DataGPT badges size to their text, without width or height reservations.');
 return errors;
}
export function validateSystemCleanup(root=process.cwd()){
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]),sources=Object.fromEntries(walk(path.join(root,'src')).filter(f=>/\.(?:astro|css|ts)$/.test(f)).map(f=>[path.relative(root,f),fs.readFileSync(f,'utf8')])),read=f=>sources[f]||'',errors=validateLogoLinks(sources);
 for(const[file,source]of Object.entries(sources))errors.push(...validateAccentMixes(source,file));
 errors.push(...validateCatalogAccentEdges(read('src/styles/design-system.css'),read('src/styles/design-system-motion.css')));
 errors.push(...validateProjectDemo(read('src/styles/design-system-motion.css')));
 const tokens=read('src/styles/tokens.css');if(!tokens.includes(':where(.skill-tag--accent),\n:where(.case-study-decision-card__icon)'))errors.push('Resolve the shared tint at consumers so local project accents remain unchanged.');if((tokens.match(/--color-bg-accent-subtle\s*:/g)||[]).length!==1||!tokens.includes('color-mix(in srgb, var(--color-interactive-accent) 12%,'))errors.push('Accent tint has one source, mixed12% into Surface.');
 for(const file of['global.css','case-study-decision-card.css','hooko-case-study.css','design-system.css','design-system-motion.css'])if(!read('src/styles/'+file).includes('var(--color-bg-accent-subtle)'))errors.push('Shared tint consumer missing: '+file);
 if(read('src/styles/global.css').includes(":root[data-theme='dark'] .skill-tag--accent:not(")||!read('src/data/system-colors.ts').includes('export const colorCards=[...paletteColors,accentSubtleColor]')||!read('src/components/DSFoundations.astro').includes('{colorCards.map'))errors.push('Accent chips keep their tint in both themes; render the derived role separately from the primitive palette.');
 const data=read('src/components/DataGPTCaseStudy.astro'),css=read('src/styles/datagpt-case-study.css'),exclusions=read('src/data/typography-exclusions.ts');
 errors.push(...validateDataGPTBadges(css));
 if(/product-avatar|product-badge/.test(data+exclusions)||/"selector": "\.dg-(?:badge|avatar)"/.test(exclusions))errors.push('DataGPT badges and initials cannot retain typography exclusions.');
 for(const[markup]of data.matchAll(/<span\b[^>]*class="dg-(?:badge|avatar)[^"]*"[^>]*>/g))if(!markup.includes('text-label-s'))errors.push('DataGPT labels must consume the complete Label/S role.');
 for(const[rule]of css.matchAll(/\.dg-(?:badge|avatar)\s*\{[^}]+\}/g))if(/(?:font(?:-size|-weight|-family)?|line-height|letter-spacing)\s*:/.test(rule))errors.push('DataGPT labels cannot override Label/S.');
 if(!/\.dg-testimonials \.dg-quote-decoration \{ font-size: 2rem; font-weight: 600; position: absolute; left: var\(--space-3\); top: var\(--space-2\);/.test(css)||(data.match(/data-typography-exclusion="decorative-quote" aria-hidden="true"/g)||[]).length!==2)errors.push('Preserve the original quote typography and coordinates.');
 if(/130px/.test(read('src/styles/global.css'))||/\.hero-content\s*\{[^}]*padding-right\s*:/.test(read('src/styles/global.css')))errors.push('Hero must not reserve unused right padding.');
 return errors;
}
