import {readTypographyTokens} from '../src/data/system-typography.ts';
import {createRequire} from 'node:module';
import {dirname} from 'node:path';
const require=createRequire(import.meta.url),astro=dirname(require.resolve('astro/package.json')),vite=dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));

export function validateCatalogTypographyLayout(css,catalog,toggle){
 const errors=[],tree=postcss.parse(css),stacked=new Map(),shared=new Map();
 tree.walkRules(rule=>{let parent=rule.parent,isStacked=false;while(parent){if(parent.type==='atrule'&&parent.name==='media'&&parent.params==='(max-width:1399px)')isStacked=true;parent=parent.parent;}const values=Object.fromEntries(rule.nodes.filter(node=>node.type==='decl').map(node=>[node.prop,node.value]));(isStacked?stacked:shared).set(rule.selector,{...(isStacked?stacked:shared).get(rule.selector),...values});});
 const requireValue=(rules,selector,property,value)=>{if(rules.get(selector)?.[property]!==value)errors.push(`Catalog Typography/theme contract: ${selector} ${property} must be ${value}`);};
 requireValue(stacked,'.ds-type-device','border-radius','0');
 requireValue(stacked,'.ds-type-device[data-type-device="desktop"]','border-radius','var(--radius-medium) var(--radius-medium) 0 0');
 requireValue(stacked,'.ds-type-device[data-type-device="phone"]','border-radius','0 0 var(--radius-medium) var(--radius-medium)');
 requireValue(stacked,'.ds-type-device[data-type-device="desktop"]::before','content','none');
 requireValue(shared,'.ds-type-device::before','inset','0 var(--space-6) auto');
 requireValue(shared,'.ds-type-device-last','border-radius','0 0 var(--radius-medium) var(--radius-medium)');
 requireValue(shared,'.ds-type-live','text-box-trim','trim-both');
 requireValue(shared,'.ds-type-live','text-box-edge','cap alphabetic');
 requireValue(shared,'.ds-type-live','margin','0');
 requireValue(shared,'.ds-type-sample-slot','min-height','1cap');
 requireValue(shared,'.ds-type-sample-slot','align-items','flex-end');
 requireValue(shared,'.ds-type-device','grid-template-rows','subgrid');
 requireValue(shared,'.ds-type-info .ds-type-use','margin-top','auto');
 requireValue(stacked,'.ds-type-device','grid-template-rows','auto auto auto auto');
 if(!catalog.includes("['ds-type-sample-slot','text-'+style.id]")||!catalog.includes("style={deviceScope(style,'desktop')}")||!catalog.includes('data-type-sample={style.id} style={deviceScope(style,device)}'))errors.push('Catalog sample slots must read the Desktop cap metric, retaining each device sample role.');
 if(css.includes('.ds-type-device-first')||catalog.includes('ds-type-device-first'))errors.push('Stacked radius must use device hooks, never a first-style class.');
 if(!catalog.includes('data-type-device={device}')||!catalog.includes("index===typography.length-1&&'ds-type-device-last'"))errors.push('Preserve device hooks and desktop column endings.');
 for(const [mode,icon,label] of [['light','sun','Light'],['dark','moon','Dark']])if(!toggle.includes(`{value:'${mode}',label:'${label}',icon:'${icon}'}`)||!toggle.includes('<SegmentedControl theme'))errors.push(`Theme segment ${mode} must use the shared decorative ${icon} before its existing label.`);
 requireValue(shared,'.theme-toggle-group .button','gap','var(--space-2)');
 requireValue(shared,'.theme-toggle-group .button > span','text-box-trim','trim-both');
 requireValue(shared,'.theme-toggle-group .button > span','text-box-edge','text');
 for(const property of ['width','height'])requireValue(shared,'.theme-toggle-group .icon',property,'var(--icon-size-compact)');
 return errors;
}

// The approved specification is independent of the catalog renderer.
export const approvedTypography={
 'heading-xl':['Funnel Display',400,.909091,[4.75,-.048],[3,-.046],[2.5,-.045]],
 'heading-l':['Funnel Display',400,1.142857,[3.5,-.047],[2.25,-.044],[1.625,-.042]],
 'heading-m':['Funnel Display',500,1.333333,[1.5,-.034],[1.375,-.032],[1.375,-.032]],
 'body-l':['Urbanist',400,1.5,[1.25,0],[1.125,0],[1.125,0]],
 'body-m':['Urbanist',400,1.5,[1,0],[1,0],[1,0]],
 'body-m-strong':['Urbanist',500,1.5,[1,0],[1,0],[1,0]],
 'body-s':['Urbanist',400,1.428571,[.875,0],[.875,0],[.875,0]],
 'label-m':['Funnel Display',500,1.428571,[.875,-.036],[.875,-.036],[.875,-.036]],
 'label-s':['Urbanist',500,1.333333,[.75,0],[.75,0],[.75,0]],
};
export function validateTypographySystem(tokens,styles,catalog){
 styles=styles.replace(/\/\*[\s\S]*?\*\//g,'');
 const errors=[];let model;try{model=readTypographyTokens(tokens);}catch(e){return[e.message];}
 if(model.boundaries.tablet!==768||model.boundaries.desktop!==1024)errors.push('Text switches only at 768/1024.');
 for(const style of model.styles){const expected=approvedTypography[style.id];
  for(const [index,device] of ['desktop','tablet','phone'].entries()){
   const v=style.devices[device],pair=expected[index+3];
   if(!v.family.includes(expected[0])||Number(v.weight)!==expected[1]||Number(v.lineHeight)!==expected[2]||v.sizeRem!==pair[0]||v.spacingEm!==pair[1]||!/^\.?[\d.]+rem$/.test(v.size)||! /^-?\.?[\d.]+em$/.test(v.spacing))errors.push(`${style.id}/${device} differs from approved type table.`);
  }
  const matches=[...styles.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([,selector])=>new RegExp('^\\.text-'+style.id+'(?:,|$)').test(selector.trim()));
  if(matches.length!==1)errors.push(`${style.id} requires one canonical rule.`);
  for(const [property,token] of [['font-family','font'],['font-size','text'],['font-weight','font-weight'],['line-height','line-height'],['letter-spacing','letter-spacing']])if(!matches[0]?.[2].replace(/\s+/g,' ').includes(`${property}: var(--${token}-${style.id})`))errors.push(`${style.id} must own ${property}.`);
 }
 if(/--text-(?:body-compact|body-compact-relative|stat-compact|contact-compact)|--(?:text|letter-spacing)-[\w-]+:\s*(?:clamp|calc)/.test(tokens))errors.push('Retired/fluid typography tokens found.');
 for(const marker of ['typographySystem()','data-type-device','data-type-sample','style.devices[device].sizeRem','style.devices[device].spacingEm','data-type-size','data-type-spacing','foundationCode[item.id]'])if(!catalog.includes(marker))errors.push(`Catalog must read source values: ${marker}.`);
 return errors;
}

// Additional static entry point appended after the site-wide migration.
export function validateStaticTypography(files, exemptions){
 const errors=[];
 for(const [file,source] of Object.entries(files)){
  if(file.endsWith('/tokens.css')||file.endsWith('/typography.css')||file.endsWith('/static-preview.css'))continue;
  const css=source.replace(/\/\*[\s\S]*?\*\//g,'');
  for(const [,rawSelector,body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
   const selector=rawSelector.trim().replace(/\s+/g,' ');
   if(selector==='@font-face')continue;
   const properties=[...body.matchAll(/(?:^|;)\s*(font|font-size|font-weight|font-family|line-height|letter-spacing)\s*:/g)].map(([,p])=>p);
   if(!properties.length)continue;
   const exemption=exemptions.find(row=>row.file===file&&row.selector===selector);
   if(!exemption?.reason)errors.push(`${file}: ${selector} defines ${properties.join(', ')} outside the nine roles.`);
  }
 }
 return errors;
}
