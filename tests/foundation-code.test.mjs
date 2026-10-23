import assert from'node:assert/strict';import fs from'node:fs';import{foundationSourceCode}from'../src/data/system-code.ts';import{validateTokenSource,validateRenderedFoundationCode,validateRenderedThemeZones,validateFoundationCodeContract}from'../scripts/validate-foundation-code.mjs';
const css=fs.readFileSync('src/styles/tokens.css','utf8');assert.deepEqual(validateFoundationCodeContract(),[]);assert(validateTokenSource(css+'\n@media (max-width:767px){:root{--gutter:24px}}').length);assert(validateTokenSource(css.replace('data-color-zone', 'class-theme-zone')).length);assert(validateTokenSource(css.replace(/--color-focus-ring:\s*var\(--color-text-primary\);/,'--color-focus-ring: var(--color-ink);')).length);
for(const [token,value]of [['radius-xs','8px'],['radius-small','12px']])assert(validateTokenSource(css.replace(`--${token}: ${value}`,`--${token}: 9px`)).length,'Radius values stay pinned: '+token);
const source=foundationSourceCode(),escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),html=source.blocks.map(b=>`<code data-ds-code-source="${b.key}">${escape(b.source)}</code>`).join('');assert.deepEqual(validateRenderedFoundationCode(html,source.blocks),[]);assert(validateRenderedFoundationCode(html.replace('#FFFFFF','#FF0000'),source.blocks).length,'A stale/edited code value fails exact source proof');assert(validateRenderedFoundationCode(html+'<button role="tab">Styles</button>',source.blocks).length,'Retired tab label fails');assert(/--text-heading-xl:\s*2.5rem; \/\* 40px \*\//.test(css));
for(const html of ['<div class="floating-control-theme">','<article class="case-study-chapter--inverse">','<div class="case-study-decision-card__impact" data-color-zone="dark" data-zone-keep="shadows">'])assert(validateRenderedThemeZones(html).length,'Every rendered dynamic/indirect theme consumer is checked');
assert.deepEqual(validateRenderedThemeZones('<div class="floating-control-theme" data-color-zone="light" data-zone-keep="shadows">'),[]);
assert(validateTokenSource(css.replace('/* Heading/XL */','/* '+ 'x'.repeat(61)+' */')).length,'Overlong paired Code source fails');
assert(validateTokenSource(css.replace('/* Palette ·','\n\n/* Palette ·')).length,'Double blank lines fail');
assert(validateTokenSource(css.replace("[data-theme='dark'],",":root[data-theme='dark'],\n[data-theme='dark'],")).length,'Duplicate Dark root without priority fails');
assert(validateRenderedThemeZones('<div class="about-details" data-color-zone="dark" data-zone-keep="section shadows">').length,'About retains page Large while using Dark Small');
assert(validateRenderedThemeZones('<span data-zone-keep="nonsense">').length,'Unknown helper keyword fails');
assert(validateRenderedThemeZones('<span '+['data','shadow','theme'].join('-')+'="page">').length,'Retired attribute fails');
console.log('Foundation code equals literal source; stale values, reversed queries, class themes, missing rendered zones and tab-label regressions fail.');

assert(validateTokenSource(css.replace(":root,\n[data-theme='light'],",":root, [data-theme='light'],")).length,'Token selectors have separate lines');

assert.deepEqual(validateRenderedThemeZones('<button class="icon-button icon-button--raised">'),[]);
assert(validateRenderedThemeZones('<button class="icon-button icon-button--raised" data-color-zone="light" data-zone-keep="shadows focus-ring">').length,'Raised must not force a Light zone');
