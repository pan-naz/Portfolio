import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
// Frozen documentation states are generated from the actual shared CSS. There
// are no hand-copied component values and this output is catalog-only.
export function statePreviewStyles(root = process.cwd()) {
 const css = readFileSync(resolve(root, 'src/styles/global.css'),'utf8');
 const states = { hover: ':hover', focus: ':focus-visible', pressed: ':active', active: "[aria-pressed='true']" };
 const rules: string[] = [];
 for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!/button|navigation-item|text-link|:where\(button/.test(selectors)) continue;
  for (const [state,pseudo] of Object.entries(states)) {
   if (!selectors.includes(pseudo) && !(state === 'active' && selectors.includes('[aria-current]'))) continue;
   let mapped = selectors.replace(/:is\(([^)]*)\)/g, (all, inner: string) => inner.includes(pseudo) || state === 'active' && inner.includes('[aria-current]') ? `[data-ds-preview-state="${state}"]` : all);
   mapped = mapped.replaceAll(pseudo, `[data-ds-preview-state="${state}"]`);
   if (state === 'active') mapped = mapped.replaceAll('[aria-current]', '[data-ds-preview-state="active"]');
   const selected: string[] = []; let depth = 0, start = 0; for (let i = 0; i <= mapped.length; i++) { if (mapped[i] === '(' || mapped[i] === '[') depth++; if (mapped[i] === ')' || mapped[i] === ']') depth--; if (i === mapped.length || mapped[i] === ',' && depth === 0) { const selector = mapped.slice(start, i); if (selector.includes(`data-ds-preview-state="${state}"`)) selected.push(selector); start = i + 1; } }
   if (!selected.length) continue;
   rules.push(`${selected.map(selector => `html[data-static] .ds-state-example ${selector.trim()}`).join(',')} {${body}}`);
  }
 }
 return `@layer system, project; @layer system {${rules.join('\n')}}`;
}
