import type { SourceComponent } from './system-inventory';
/** Only enum/boolean inputs observed on the real website are catalog variants. */
export function componentVariants(component: SourceComponent) {
  const defaults = new Map([...component.source.matchAll(/\b(\w+)\s*=\s*(?:'([^']*)'|(true|false))\s*[,}]/g)].map(([,name,quoted,bool]) => [name, quoted ?? bool]));
  const variantProps = component.props.filter(prop => prop.type === 'boolean' || /'[^']*'\s*\|/.test(prop.type));
  const variants = new Set<string>();
  for (const usage of component.usages) for (const prop of variantProps) {
    const value = usage.props[prop.name] ?? defaults.get(prop.name);
    if (value === undefined || value.startsWith('{')) continue;
    variants.add(`${prop.name}=${value}`);
  }
  return [...variants].sort();
}
