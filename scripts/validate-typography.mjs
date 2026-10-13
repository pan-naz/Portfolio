import {readTypographyTokens} from '../src/data/system-typography.ts';

// The approved specification is independent of the catalog renderer.
export const approvedTypography={
 'heading-xl':['Funnel Display',400,.909091,[4.75,-.048],[3,-.046],[2.5,-.045]],
 'heading-l':['Funnel Display',400,1.142857,[3.5,-.047],[2.25,-.044],[1.625,-.042]],
 'heading-m':['Funnel Display',500,1.333333,[1.5,-.04],[1.375,-.038],[1.375,-.038]],
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
  for(const [property,token] of [['font-family','font'],['font-size','text'],['font-weight','font-weight'],['line-height','line-height'],['letter-spacing','letter-spacing']])if(!matches[0]?.[2].includes(`${property}: var(--${token}-${style.id})`))errors.push(`${style.id} must own ${property}.`);
 }
 if(/--text-(?:body-compact|body-compact-relative|stat-compact|contact-compact)|--(?:text|letter-spacing)-[\w-]+:\s*(?:clamp|calc)/.test(tokens))errors.push('Retired/fluid typography tokens found.');
 for(const marker of ['typographySystem()','data-type-device','data-type-sample','style.devices[device].sizeRem','style.devices[device].spacingEm','data-type-size','data-type-spacing','deviceCode(device)'])if(!catalog.includes(marker))errors.push(`Catalog must read source values: ${marker}.`);
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
