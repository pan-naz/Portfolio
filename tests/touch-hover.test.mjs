import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {unguardedHoverRules,validateHoverSource,validateLogoWave,validateThemeIconMotion} from '../scripts/validate-hover.mjs';
assert.deepEqual(validateHoverSource(),[]);
assert.equal(unguardedHoverRules('.button:hover {color:red}').length,1);
assert.equal(unguardedHoverRules('@media (hover: hover){.button:hover{color:red}}').length,1);
assert.deepEqual(unguardedHoverRules('@media (hover: hover) and (pointer: fine){.button:hover{color:red}}'),[]);
assert.deepEqual(unguardedHoverRules('.button:focus-visible,.button:active {color:red}'),[]);
console.log('Touch hover guard requires both fine pointer and hover capability, while retaining focus and press states.');

const css=readFileSync('src/styles/global.css','utf8'),logo=readFileSync('src/components/Logo.astro','utf8'),tokens=readFileSync('src/styles/tokens.css','utf8');
assert.deepEqual(validateThemeIconMotion(css),[]);
const theme=readFileSync('src/components/ThemeToggle.astro','utf8');
assert.deepEqual(validateThemeIconMotion(css,theme),[]);
assert(validateThemeIconMotion(css,theme.replace("icon:'sun'",'')).length,'Reject a segment disconnected from the shared motion');
for(const [from,to]of [['var(--duration-toggle-enter)','600ms'],['var(--duration-toggle-return)','600ms'],['var(--ease-toggle-rotation)','ease-out'],['.theme-icon-control:hover .theme-icon-glyph','.theme-toggle:hover .theme-icon-glyph'],['scale(var(--scale-press))','scale(.9)']])assert(validateThemeIconMotion(css.replaceAll(from,to)).length,'Reject changed/shared theme motion: '+to);
assert(validateThemeIconMotion(css+' .theme-toggle-group .icon {transform:rotate(180deg);}').length,'Reject a copied segmented motion rule');
assert.deepEqual(validateLogoWave(css,logo,tokens),[]);
for(const [from,to] of [
 ['var(--duration-logo-wave)','935ms'],['var(--ease-spring-wave)','linear'],
 ['scale(var(--scale-logo-wave))','scale(1.15)'],['calc(var(--distance-icon-shift) * -1)','-3px'],
 ['calc(var(--stagger-title-reveal) * var(--logo-letter-index))','35ms'],
])assert.ok(validateLogoWave(css.replaceAll(from,to),logo,tokens).length,'Reject literal wave setting '+to);
assert.ok(validateLogoWave(css,logo+'<script>animate()</script>',tokens).length);
assert.ok(validateLogoWave(css,logo,tokens,'const dataLogo="data-logo-letter";').length);
console.log('Logo wave guard rejects literals, JavaScript and animation libraries; CSS uses source motion tokens only.');
