import { dsComponents } from './ds-components.ts';
export const dsGroups = [
  { label: 'Overview', links: [['overview', 'Overview']] },
  { label: 'Foundations', links: [['color', 'Color'], ['typography', 'Typography'], ['spacing', 'Spacing'], ['shape', 'Radius & elevation'], ['layout', 'Layout'], ['motion', 'Motion'], ['iconography', 'Iconography']] },
  { label: 'Components', links: dsComponents.map(component => [component.section, component.name]) },
  { label: 'Patterns', links: [['case-study-transition', 'Case-study transition'], ['floating-header', 'Floating header'], ['work-filter', 'Work filter']] },
  { label: 'Guidelines', links: [['accessibility', 'Accessibility'], ['writing', 'Writing']] },
];
