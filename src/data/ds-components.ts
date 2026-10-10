import { basename } from 'node:path';
import { componentPurposes } from './system-documentation.ts';
import { reusableComponents } from './system-components.ts';
export const dsComponents = reusableComponents.map(item => ({ ...item, name: basename(item.file, '.astro'), section: item.documentedHidden || (item.title || basename(item.file, '.astro')).toLowerCase().replaceAll(' ', '-'), preview: item.documentedHidden ? 'documentation' : 'direct', description: componentPurposes[item.file] }));
export const visibleComponents = dsComponents.filter(item => !item.documentedHidden).sort((a,b) => a.title!.localeCompare(b.title!));
