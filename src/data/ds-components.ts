import { basename } from 'node:path';
import { componentPurposes } from './system-documentation.ts';
import { reusableComponents } from './system-components.ts';
export const dsComponents = reusableComponents.map(item => ({ ...item, name: basename(item.file, '.astro'), section: item.id || item.catalogPage || item.documentedHidden || (item.title || basename(item.file, '.astro')).toLowerCase().replaceAll(' ', '-'), preview: item.documentedHidden ? 'documentation' : 'direct', description: componentPurposes[item.file] }));
export const catalogComponents = dsComponents.filter(item => !item.documentedHidden);
export const visibleComponents = catalogComponents.filter(item => !item.catalogPage).sort((a,b) => a.title!.localeCompare(b.title!));

/** Overview notes are manifest-derived; composed parts already have their parent page. */
export const overviewHiddenComponents = dsComponents.filter(item => item.documentedHidden && !['Icon','SectionNavigation','Logo','ThemeToggle','ProjectIdentity','ProjectTags'].includes(item.name)).sort((a,b) => a.title!.localeCompare(b.title!));
