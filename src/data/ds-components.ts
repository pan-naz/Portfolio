import { basename } from 'node:path';
import { componentPurposes } from './system-documentation.ts';
export const dsComponents = Object.entries(componentPurposes).map(([file, description]) => ({ name: basename(file, '.astro'), file, section: `component-${basename(file, '.astro').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`, preview: 'documentation', description }));
