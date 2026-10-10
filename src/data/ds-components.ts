import { basename } from 'node:path';
import { componentPurposes } from './system-documentation.ts';
import { reusableComponents } from './system-components.ts';
export const dsComponents = reusableComponents.map(item => ({ ...item, name: basename(item.file, '.astro'), section: `component-${basename(item.file, '.astro').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`, preview: 'direct', description: componentPurposes[item.file] }));
