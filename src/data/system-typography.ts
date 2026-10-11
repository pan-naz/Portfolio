import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSystemTokens } from './system-inventory.ts';

/** Read shared text roles, including literal declarations, from the real CSS. */
export function systemTypography(root = process.cwd()) {
  const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
  const tokens = readSystemTokens(readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8'));
  const selectors = ['.text-heading-xl', '.text-heading-l', 'h3', '.text-body-l', '.text-body-m', '.text-body-m-strong', '.text-body-s', '.eyebrow', '.skill-tag'];
  const declaration = (selector: string, property: string) => {
    let value = '';
    for (const [, names, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!names.split(',').map(name => name.trim()).includes(selector)) continue;
      const found = body.match(new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`));
      if (found && !(property === 'font-size' && value)) value = found[1].trim();
    }
    return value;
  };
  const resolveValue = (raw: string) => raw.replace(/var\(--([\w-]+)\)/g, (_, name: string) => tokens.value(tokens.light, name));
  return selectors.map(selector => {
    const size = declaration(selector, 'font-size');
    const spacing = declaration(selector, 'letter-spacing');
    const parts = (spacing.match(/var\(--letter-spacing-([\w-]+)/)?.[1] || '').split('-');
    const name = `${parts[0][0].toUpperCase()}${parts[0].slice(1)}/${(parts[1] || '').toUpperCase()}${parts.length > 2 ? ' ' + parts.slice(2).map(part => part[0].toUpperCase() + part.slice(1)).join(' ') : ''}`;
    const resolvedSize = resolveValue(size);
    const clamp = resolvedSize.match(/^clamp\(([^,]+),.*?,\s*([^,]+)\)$/);
    const resolvedSpacing = resolveValue(spacing);
    const ratio = resolvedSpacing.match(/^calc\(([-\d.]+)\s*\/\s*([\d.]+)\s*\*\s*1em\)$/);
    const fixedSize = parseFloat(resolvedSize) * (resolvedSize.endsWith('rem') ? 16 : 1);
    const tracking = ratio ? Number(ratio[1]) / Number(ratio[2]) : resolvedSpacing.endsWith('px') ? parseFloat(resolvedSpacing) / fixedSize : parseFloat(resolvedSpacing);
    return { selector, name, sizeToken: size.match(/var\(--([\w-]+)/)?.[1] || '', family: resolveValue(declaration(selector, 'font-family') || declaration(':root', 'font-family')), weight: resolveValue(declaration(selector, 'font-weight') || declaration('body', 'font-weight')), range: clamp ? `${clamp[1]} → ${clamp[2]}` : resolvedSize, lineHeight: resolveValue(declaration(selector, 'line-height')), tracking: `${Number(tracking.toFixed(8))}em`, rawTracking: resolvedSpacing };
  });
}
