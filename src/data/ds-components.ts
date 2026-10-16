import { basename } from 'node:path';
import { componentPurposes } from './system-documentation.ts';
import { reusableComponents } from './system-components.ts';
export const dsComponents = reusableComponents.map(item => ({ ...item, name: basename(item.file, '.astro'), section: item.catalogPage || item.documentedHidden || (item.title || basename(item.file, '.astro')).toLowerCase().replaceAll(' ', '-'), preview: item.documentedHidden ? 'documentation' : 'direct', description: componentPurposes[item.file] }));
export const catalogComponents = dsComponents.filter(item => !item.documentedHidden);
export const visibleComponents = catalogComponents.filter(item => !item.catalogPage).sort((a,b) => a.title!.localeCompare(b.title!));

/** Overview notes are manifest-derived; Icon already has the Icons foundation. */
export const overviewHiddenComponents = dsComponents.filter(item => item.documentedHidden && item.name !== 'Icon').sort((a,b) => a.title!.localeCompare(b.title!));
