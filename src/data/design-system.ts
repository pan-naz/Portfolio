import { dsComponents } from './ds-components.ts';
export const componentGroups = ['Actions', 'Navigation', 'Content', 'Projects', 'Media & storytelling', 'Identity'].filter(label => dsComponents.some(item => item.group === label)).map(label => ({label, components: dsComponents.filter(item => item.group === label)}));
export const dsGroups = [
  { label: 'Overview', links: [['overview', 'Overview']] },
  { label: 'Foundations', links: [['color', 'Color'], ['typography', 'Typography'], ['spacing', 'Spacing'], ['shape', 'Radius & elevation'], ['layout', 'Layout'], ['motion', 'Motion'], ['iconography', 'Iconography']] },
  ...componentGroups.map(group => ({label: group.label, links: group.components.map(component => [component.section, component.title!])})),
  { label: 'Guidelines', links: [['accessibility', 'Accessibility'], ['writing', 'Writing']] },
];
