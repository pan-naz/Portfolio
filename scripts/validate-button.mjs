import {compareTokenNames} from '../src/data/system-component-tokens.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import {buttonGroups,buttonProps,buttonUsage,buttonStates,buttonStateGroups,buttonTokens,buttonTokenGroups} from '../src/data/system-button.ts';
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

/** Ask TypeScript's binder about the complete, copyable Astro Usage example. */
export function missingUsageNames(usage){
 const [,frontmatter,...body]=usage.split('---'),file='button-usage.tsx';
 const source=ts.createSourceFile(file,frontmatter+'\nconst specimen = (<>\n'+body.join('---')+'\n</>);',ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const options={noEmit:true,noLib:true,noResolve:true,types:[],jsx:ts.JsxEmit.Preserve,target:ts.ScriptTarget.Latest};
 const host=ts.createCompilerHost(options);host.getSourceFile=name=>name===file?source:undefined;
 return ts.createProgram([file],options,host).getSemanticDiagnostics().filter(diagnostic=>diagnostic.code===2304).map(diagnostic=>ts.flattenDiagnosticMessageText(diagnostic.messageText,' '));
}

/** Catalog state colors must remain independent of website Secondary role overrides. */
export function validateCatalogControls(control,css){
 const errors=[],rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim(),body}));
 if(!control.includes('button--catalog')||/button--secondary|import\s+Button\b/.test(control))errors.push('DSControl must own catalog states without website Secondary.');
 const catalog=rules.filter(rule=>rule.selector.includes('.button--catalog'));
 if(catalog.some(rule=>/--color-[\w-]+\s*:|!important/.test(rule.body)))errors.push('DSControl must read theme roles without local color overrides.');
 const rule=selector=>catalog.find(rule=>rule.selector===selector)?.body||'';
 const rest=rule('.button.button--catalog');
 if(!/background:transparent;/.test(rest)||!rest.includes('color:var(--color-text-secondary);'))errors.push('Unselected catalog controls need transparent secondary rest.');
 for(const state of ['hover','active']){
  const body=rule('.button.button--catalog:not([aria-selected=true],[aria-pressed=true]):'+state);
  if(!body.includes('background:var(--color-bg-surface-subtle);')||!body.includes('color:var(--color-text-primary);'))errors.push('Unselected catalog '+state+' needs subtle fill and primary ink.');
 }
 if(!rule('.button.button--catalog:active').includes('transform:none;'))errors.push('Catalog press must keep the pill and label stationary in every selection state.');
 for(const [attribute,background,color] of [['aria-selected','--color-bg-surface-subtle','--color-text-primary'],['aria-pressed','--color-text-primary','--color-bg-canvas']]){
  const body=rule('.button.button--catalog['+attribute+'=true]');
  if(!body.includes('background:var('+background+');')||!body.includes('color:var('+color+');'))errors.push('Selected catalog '+attribute+' must keep its theme roles.');
 }
 const focus=rule('.button.button--catalog:focus-visible');
 if(!focus.includes('outline:1px solid var(--color-focus-ring);')||!focus.includes('outline-offset:2px;')||/(?:background|color)\s*:/.test(focus))errors.push('Catalog focus must add only its existing ring, preserving state colors.');
 return errors;
}

export function validateButtonCatalog(root=process.cwd()){
 const read=file=>fs.readFileSync(root+'/'+file,'utf8'),errors=[];
 const expected=['Button','Chip','Navigation','Project card','Section heading','Statistic','Timeline row','Tool card & Tooltip'];
 if(JSON.stringify(visibleComponents.map(item=>item.title))!==JSON.stringify(expected))errors.push('Button navigation must have exactly eight action/content pages.');
 for(const name of ['IconButton','TextLink'])if(!catalogComponents.some(item=>item.name===name&&item.section==='button'))errors.push(name+' must be documented in Button, not removed.');
 const model=buildSystemInventory(root);
 for(const name of ['Button','IconButton','TextLink']){
  const component=model.components.find(item=>item.name===name),props=buttonProps(component);
  if(props.length!==component.props.length||props.some(prop=>!prop.description||/Optional .* input\.|Required .* input\./.test(prop.description)))errors.push(name+' requires one clear description for every source prop.');
  if(/['"]catalog['"]/.test(component.source)||/className\.(?:includes|match|startsWith)/.test(component.source))errors.push(name+' cannot have catalog options or infer behavior from class names.');
  const usage=buttonUsage(name);
  for(const missing of missingUsageNames(usage))errors.push(name+' Usage: '+missing);
  const specimens=specimenVariants(component,read('src/components/DSButtonSpecimen.astro'));
  const used=componentVariants(component);
  for(const variant of used)if(!specimens.includes(variant))errors.push(name+' website variant has no real specimen: '+variant);
  for(const variant of specimens)if(!used.includes(variant))errors.push(name+' has an unused specimen variant: '+variant);
  if(usage.split('\n').some(line=>line.length>76))errors.push('Button Usage must fit desktop blocks: '+name);
  if(name==='IconButton'&&(/class[=:]|<span|import Icon from/.test(usage)||usage.match(/<IconButton(?=\s|\/>)/g)?.length!==2||!usage.includes('variant="raised"')||!usage.includes('icon="layers"')))errors.push('Icon Usage needs two explicit source examples.');
  if(!usage.includes('import '+name)||!usage.includes('<'+name))errors.push('Source Usage missing: '+name);
 }
 const actionComponents=model.components.filter(item=>['Button','IconButton','TextLink'].includes(item.name));
 const direct=buttonTokens(actionComponents),groups=buttonTokenGroups(actionComponents);
 if(direct.some(name=>/^--(?:font-|text-|line-height-|letter-spacing-|color-(?:white|paper|ink|night|charcoal|graphite))/.test(name)))errors.push('Action Tokens must omit palette and typography internals.');
 if(JSON.stringify(groups.map(group=>group.title))!==JSON.stringify(['Color','Size','Spacing','Shape','Elevation','Motion'])||JSON.stringify(groups.flatMap(group=>group.names).sort(compareTokenNames))!==JSON.stringify(direct))errors.push('Every direct token belongs to one of the six action groups.');
 const ids=buttonGroups.flatMap(group=>group.cards.map(card=>card.id));
 if(ids.length!==13||new Set(ids).size!==13)errors.push('Exactly thirteen used variants must be shown once.');
 if(!read('src/components/IconButton.astro').includes("const fixedLight = variant === 'raised';"))errors.push('Raised owns its fixed Light zone.');
 if(!read('src/components/WorkSection.astro').includes('variant="raised"')||!read('src/components/CaseStudyPage.astro').includes('variant="raised"'))errors.push('Website cursor and close must use raised.');
 if(/button--arrow-fill\.button--small/.test(read('src/styles/global.css')))errors.push('Unused small primary-arrow CSS remains.');
 for(const file of ['DSTabs','DSTokenNames','SegmentedControl'])if(!read('src/components/'+file+'.astro').includes('DSControl'))errors.push(file+' must use the catalog control helper.');
 errors.push(...validateCatalogControls(read('src/components/DSControl.astro'),read('src/styles/design-system.css')));
 const states=read('src/scripts/design-system-button.ts');
 if(!states.includes('CSSStyleRule')||!states.includes('rule.style.cssText')||!states.includes('rule.cssText.startsWith(\'@layer\')'))errors.push('Frozen states must read actual shared CSS without changing its layer.');
 const page=read('src/components/DSButtons.astro');
 if(/DSTokenNames|ds-token-swap|data-ds-names/.test(page+read('src/styles/design-system-button.css')))errors.push('Button must have no token-name switch or swap.');
 const usage=buttonUsage('IconButton');
 if(/\{\.\.\.|const (?:close|layers) =/.test(usage)||!usage.includes('// The theme switch is <ThemeToggle />, built on IconButton.')||!usage.includes('// Media controls are default icon buttons inside the video player.')||usage.indexOf('// Media')>usage.lastIndexOf('---'))errors.push('Explicit Icon Usage and script comments are required.');
 const css=read('src/styles/design-system-button.css');
 if(!css.includes('.ds-button-view .ds-comparison-switch .case-comparison-images { display:none; }'))errors.push('Button-only Toggle images and visible value-row alignment must be explicit.');
 if(!css.includes('.ds-button-state-cell { min-width:0;'))errors.push('State rows must shrink to their card, never to unwrapped content.');
 if(!css.includes('transform:rotate(calc(var(--rotation-icon-close) / 2))')||!page.includes('ds-button-turn')||!page.includes('ds-button-state-name--phone text-body-m-strong'))errors.push('Close mid-turn and phone state names must use shared tokens/styles.');
 if(!states.includes("querySelectorAll('.ds-button-values > div').length")||!states.includes('.ds-button-stage-art'))errors.push('Fit every metadata row and the unwrapped secondary-arrow specimen.');
 if(!page.includes('buttonStateGroups.map')||!page.includes('buttonStates.map')||buttonStates.length!==4||JSON.stringify(buttonStateGroups.map(group=>group.cards.map(card=>card.id)))!==JSON.stringify([['primary','secondary','toggle'],['raised','plain','layers','media'],['link-default','link-accent','link-compact']]))errors.push('States need exactly the reviewed three/four/three variants.');
 if(/>States<\//.test(page)||JSON.stringify(buttonStateGroups.map(group=>group.name))!==JSON.stringify(['Button states','Icon button states','Text link states']))errors.push('Each State block has one plain label, with no separate States heading.');
 if(!page.includes('inert aria-hidden="true"'))errors.push('Button stages must be inert and hidden from assistive technology.');
 if(!read('src/scripts/design-system.ts').includes("['icon-button','text-link']"))errors.push('Retired action hashes must redirect to Button.');
 const global=read('src/styles/global.css');
 if(/:is\(\.project-cursor\.is-case-control, \.case-study-direct-close\)/.test(global)||!global.includes(".icon-button--raised[data-icon='close']:hover svg > g")||!global.includes('.icon-button--raised:hover'))errors.push('Raised owns white hover and the close turn.');
 if(!css.includes('grid-template-columns:var(--space-16) repeat(4,minmax(0,1fr))')||!page.includes('ds-button-state-labels'))errors.push('States require one label plus four equal columns.');
 const specimen=read('src/components/DSButtonSpecimen.astro');
 if(!specimen.includes("state?<Button")||specimen.includes('ds-media-backdrop')||!specimen.includes('{!state&&<div data-ds-example="icon-sound"')||/hidden=\{state==='active'\}/.test(specimen))errors.push('Toggle States show Before only; Media shows the native pill, with play only in all four States.');
 if(!css.includes('.ds-button-view .ds-stage-bar > .ds-tabs { margin-inline-start:0; }'))errors.push('Button tabs must use the same left inset in Preview and Code.');
 if(!states.includes("writes.push({element:group,scale:")||!states.includes("section.dataset.layout=layout")||!states.includes("column/paintWidth(group)<.8")||!css.includes('transform:scale(var(--ds-state-scale,1))'))errors.push('States require one block-wide scale, a minimum of80%, and whole-section card fallback.');
 if(!css.includes('padding:var(--ds-stage-clearance)'))errors.push('Inline prose shares the responsive component-stage inset.');
 if(!css.includes('grid-template-rows:var(--space-6) repeat(4,calc(var(--space-16) + var(--space-6)))')||css.includes('.ds-button-state-cell:has(.ds-button-turn)'))errors.push('Stacked title and all State rows must have the same token-defined height.');
 if(!css.includes('[data-labels="above"] .ds-button-state-column { row-gap:var(--space-6); }')||!css.includes('justify-content:flex-start; gap:var(--space-2);')||!css.includes('var(--ds-state-art-height)'))errors.push('Above labels need a small own-specimen gap, a larger inter-state gap, and scale-aware bounds.');
 if(buttonGroups[2].cards.find(card=>card.id==='link-compact').value!=='Body/M Strong'||buttonProps(model.components.find(c=>c.name==='TextLink')).find(prop=>prop.name==='compact').description!=='Keeps the arrow right after the text.')errors.push('Compact describes its real Body/M Strong type and arrow placement.');
 const propsCss=read('src/styles/design-system.css');
 if(!propsCss.includes('.ds-props-table :is(th,td):nth-child(3) { grid-column:2; grid-row:1; }')||!propsCss.includes('.ds-props-table tbody tr { border-top:1px solid var(--color-border-default); }'))errors.push('Phone Props header and rows must share placement and per-prop separators.');
 return errors;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){assert.deepEqual(validateButtonCatalog(),[]);console.log('Button catalog: source props/usage, variants, shared frozen states, raised API and catalog ownership pass.');}
