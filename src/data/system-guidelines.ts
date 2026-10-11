import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSystemTokens } from './system-inventory.ts';
import { contrastRatio, passesNormalTextAA } from '../../scripts/text-contrast.ts';

export function systemGuidelines(root = process.cwd()) {
  const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
  const tokens = readSystemTokens(readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8'));
  const focus = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([,selector,body]) => selector.includes(':focus-visible') && body.includes('outline:'))?.[2] || '';
  const outline = focus.match(/outline:\s*([^;]+)/)?.[1] || '';
  const offset = focus.match(/outline-offset:\s*([^;]+)/)?.[1] || '';
  const contrasts = ['color-text-primary', 'color-text-secondary', 'color-interactive-accent'].flatMap(foreground => ['color-bg-canvas','color-bg-surface','color-bg-surface-subtle'].map(background => ({
    foreground, background, themes: (['light','dark'] as const).map(theme => {
      const palette = tokens[theme];
      const ratio = contrastRatio(tokens.value(palette, foreground), tokens.value(palette, background));
      return { theme, ratio: ratio.toFixed(2), normalTextAA: passesNormalTextAA(ratio) };
    }),
  })));
  return { contrasts, outline, offset, target: tokens.value(tokens.light,'control-icon') };
}
