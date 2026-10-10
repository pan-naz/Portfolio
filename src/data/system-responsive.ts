import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSystemTokens } from './system-inventory.ts';
export function responsiveTokenOverrides(root = process.cwd()) {
  const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
  const base = readSystemTokens(css);
  return [...css.matchAll(/@media\s*([^{}]+)\{\s*:root\s*\{([^}]+)\}/g)].flatMap(([,query,body]) => {
    const overrides = Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([,name,value]) => [name,value.trim()]));
    return Object.keys(overrides).map(name => ({ query: query.trim(), name, value: base.value({...base.light,...overrides}, name) }));
  });
}
