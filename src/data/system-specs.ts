import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import type { SourceComponent } from './system-inventory';
/** Exact size/spacing declarations, including literals, without project CSS. */
export function componentStyleSpecs(component: SourceComponent, root = process.cwd()) {
  const classes = [...new Set([...component.source.matchAll(/\bclass(?::list)?=(?:"([^"]+)"|'([^']+)'|\{([\s\S]*?)\})/g)].flatMap(([,double,single,expression]) => (double ?? single ?? [...(expression || '').matchAll(/['"]([^'"]+)['"]/g)].map(([,value])=>value).join(' ')).split(/\s+/)).filter(value=>/^[a-z][\w-]+$/.test(value)))];
  const files = readdirSync(resolve(root, 'src/styles')).filter(file => file.endsWith('.css') && !['tokens.css','design-system.css','static-preview.css'].includes(file)).map(file => resolve(root, 'src/styles', file));
  const sources = [{file: component.file, text: component.source}, ...files.map(file => ({file:relative(root,file),text:readFileSync(file,'utf8')})).filter(source=>!/^\/\* Project-only:/.test(source.text))];
  const properties = /^(?:font-size|line-height|padding(?:-inline|-block|-top|-right|-bottom|-left)?|gap|row-gap|column-gap|min-height|min-width|width|height|border-radius|border-width|box-shadow|aspect-ratio|grid-template-columns)$/;
  const rows: {selector:string;property:string;value:string;location:string}[] = [];
  for(const source of sources) for(const match of source.text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector=match[1].trim();
    if(!classes.some(name=>new RegExp('\\.'+name+'(?=--|__|[^\\w-]|$)').test(selector))) continue;
    for(const [,property,value] of match[2].matchAll(/(?:^|;)\s*([\w-]+):\s*([^;]+)/g)) if(properties.test(property)) rows.push({selector,property,value:value.trim(),location:`${source.file}:${source.text.slice(0,match.index + match[1].indexOf(selector)).split('\n').length}`});
  }
  return rows;
}
