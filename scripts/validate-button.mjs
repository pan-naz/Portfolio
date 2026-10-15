import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {buttonGroups,buttonProps,buttonUsage,buttonStates,buttonStateGroups} from '../src/data/system-button.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {visibleComponents,catalogComponents} from '../src/data/ds-components.ts';
import {componentVariants} from '../src/data/system-variants.ts';

/** Inspect real component calls, independently of the generated coverage labels. */
export function specimenVariants(component,source){
 const defaults=new Map([...component.source.matchAll(/\b(\w+)\s*=\s*(?:'([^']*)'|(true|false))\s*[,}]/g)].map(([,name,quoted,bool])=>[name,quoted??bool]));
 const props=component.props.filter(prop=>prop.type==='boolean'||/'[^']*'\s*\|/.test(prop.type));
 const ast=ts.createSourceFile('specimens.tsx','<>'+source.split('---').slice(2).join('---')+'</>',ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),values=new Set();
 const visit=node=>{
  if((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&node.tagName.getText(ast)===component.name){
   for(const prop of props){
    const attribute=node.attributes.properties.find(attribute=>ts.isJsxAttribute(attribute)&&attribute.name.getText(ast)===prop.name);
    if(!attribute){if(defaults.has(prop.name))values.add(prop.name+'='+defaults.get(prop.name));continue;}
    if(!attribute.initializer){values.add(prop.name+'=true');continue;}
    if(ts.isStringLiteral(attribute.initializer))values.add(prop.name+'='+attribute.initializer.text);
    else {const literals=n=>{if(ts.isConditionalExpression(n)){literals(n.whenTrue);literals(n.whenFalse);}else if(ts.isStringLiteral(n)||n.kind===ts.SyntaxKind.TrueKeyword||n.kind===ts.SyntaxKind.FalseKeyword)values.add(prop.name+'='+(ts.isStringLiteral(n)?n.text:n.getText(ast)));else ts.forEachChild(n,literals);};literals(attribute.initializer);}
   }
  }
  ts.forEachChild(node,visit);
 };visit(ast);return [...values].sort();
}

export function validateButtonCatalog(root=process.cwd()){
 const read=file=>fs.readFileSync(root+'/'+file,'utf8'),errors=[];
 const expected=['Button','Chip','Navigation','Project card','Section heading','Statistic','Timeline row','Tooltip'];
 if(JSON.stringify(visibleComponents.map(item=>item.title))!==JSON.stringify(expected))errors.push('Button navigation must have exactly eight action/content pages.');
 for(const name of ['IconButton','TextLink'])if(!catalogComponents.some(item=>item.name===name&&item.section==='button'))errors.push(name+' must be documented in Button, not removed.');
 const model=buildSystemInventory(root);
 for(const name of ['Button','IconButton','TextLink']){
  const component=model.components.find(item=>item.name===name),props=buttonProps(component);
  if(props.length!==component.props.length||props.some(prop=>!prop.description||/Optional .* input\.|Required .* input\./.test(prop.description)))errors.push(name+' requires one clear description for every source prop.');
  if(/['"]catalog['"]/.test(component.source)||/className\.(?:includes|match|startsWith)/.test(component.source))errors.push(name+' cannot have catalog options or infer behavior from class names.');
  const usage=buttonUsage(name);
  const specimens=specimenVariants(component,read('src/components/DSButtonSpecimen.astro'));
  const used=componentVariants(component);
  for(const variant of used)if(!specimens.includes(variant))errors.push(name+' website variant has no real specimen: '+variant);
  for(const variant of specimens)if(!used.includes(variant))errors.push(name+' has an unused specimen variant: '+variant);
  if(usage.split('\n').some(line=>line.length>76))errors.push('Button Usage must fit desktop blocks: '+name);
  if(!usage.startsWith('import '+name)||!usage.includes('<'+name))errors.push('Source Usage missing: '+name);
 }
 const ids=buttonGroups.flatMap(group=>group.cards.map(card=>card.id));
 if(ids.length!==13||new Set(ids).size!==13)errors.push('Exactly thirteen used variants must be shown once.');
 if(!read('src/components/IconButton.astro').includes("const fixedLight = variant === 'raised';"))errors.push('Raised owns its fixed Light zone.');
 if(!read('src/components/WorkSection.astro').includes('variant="raised"')||!read('src/components/CaseStudyPage.astro').includes('variant="raised"'))errors.push('Website cursor and close must use raised.');
 if(/button--arrow-fill\.button--small/.test(read('src/styles/global.css')))errors.push('Unused small primary-arrow CSS remains.');
 for(const file of ['DSTabs','DSTokenNames','SegmentedControl'])if(!read('src/components/'+file+'.astro').includes('DSControl'))errors.push(file+' must use the catalog control helper.');
 const states=read('src/scripts/design-system-button.ts');
 if(!states.includes('CSSStyleRule')||!states.includes('rule.style.cssText')||!states.includes('rule.cssText.startsWith(\'@layer\')'))errors.push('Frozen states must read actual shared CSS without changing its layer.');
 const page=read('src/components/DSButtons.astro');
 if(!page.includes('buttonStateGroups.map')||!page.includes('buttonStates.map')||buttonStates.length!==4||buttonStateGroups.flat().length!==7)errors.push('States need seven real controls and four states.');
 if(!page.includes('inert aria-hidden="true"')||!read('src/components/DSDashboard.astro').includes('ds-button-cover'))errors.push('Button stages and Overview cover must be inert.');
 if(!read('src/scripts/design-system.ts').includes("['icon-button','text-link']"))errors.push('Retired action hashes must redirect to Button.');
 return errors;
}
if(process.argv[1]===new URL(import.meta.url).pathname){assert.deepEqual(validateButtonCatalog(),[]);console.log('Button catalog: source props/usage, variants, shared frozen states, raised API and catalog ownership pass.');}
