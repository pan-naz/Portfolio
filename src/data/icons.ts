export type IconNode = [string, Record<string, string>];
interface IconDefinition {
  nodes: IconNode[];
  weight?: 'strong';
  close?: boolean;
}

// Node attributes may opt into semantic fills; unfilled nodes inherit the regular stroke.
// Approved UI geometry; every control and decorative SVG uses the same renderer.
const plusNodes: IconNode[] = [['path', { d: 'M12 5v14M5 12h14' }]];
export const icons = {
  monitor: { nodes: [['rect', { x:'3', y:'4', width:'18', height:'13', rx:'2' }], ['path', { d:'M8 21h8M12 17v4' }]] },
  tablet: { nodes: [['rect', { x:'5', y:'2', width:'14', height:'20', rx:'2' }], ['circle', { cx:'12', cy:'18.5', r:'.5' }]] },
  phone: { nodes: [['rect', { x:'7', y:'2', width:'10', height:'20', rx:'2' }], ['circle', { cx:'12', cy:'18.5', r:'.5' }]] },
  layers: { nodes: [
    ['path', { d: 'M3.5 16.1 12 11.8l8.5 4.3L12 20.4z', fill: 'var(--icon-layer-surface, var(--color-bg-canvas))', 'data-icon-layer': 'bottom' }],
    ['path', { d: 'M3.5 12 12 7.7l8.5 4.3L12 16.3z', fill: 'var(--icon-layer-surface, var(--color-bg-canvas))', 'data-icon-layer': 'middle' }],
    ['path', { d: 'M3.5 7.9 12 3.6l8.5 4.3L12 12.2z', fill: 'var(--color-interactive-accent)', stroke: 'none', 'data-icon-layer': 'top' }],
  ] },
  plus: { weight: 'strong', nodes: plusNodes },
  close: { weight: 'strong', nodes: plusNodes, close: true },
  equals: { weight: 'strong', nodes: [['path', { d: 'M5 9h14M5 15h14' }]] },
  arrow: { nodes: [['path', { d: 'M4 12h15M13 5l7 7-7 7' }]] },
  sun: { nodes: [['circle', { cx: '12', cy: '12', r: '4' }], ['path', { d: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5' }]] },
  moon: { nodes: [['path', { d: 'M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z' }]] },
  play: { weight: 'strong', nodes: [['path', { d: 'M10 6.27l7.28 4.63a1.3 1.3 0 0 1 0 2.2L10 17.73A1.3 1.3 0 0 1 8 16.63V7.37a1.3 1.3 0 0 1 2-1.1Z' }]] },
  pause: { weight: 'strong', nodes: [['path', { d: 'M8 5v14M16 5v14' }]] },
  // Volume 2 / Volume X geometry from @lucide/icons 1.45.0 (ISC license).
  volume: { nodes: [['path', { d: 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z' }], ['path', { d: 'M16 9a5 5 0 0 1 0 6' }], ['path', { d: 'M19.364 18.364a9 9 0 0 0 0-12.728' }]] },
  'volume-muted': { nodes: [['path', { d: 'M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z' }], ['path', { d: 'm16.5 14.5 5-5' }], ['path', { d: 'm16.5 9.5 5 5' }]] },
  'shield-check': { weight: 'strong', nodes: [['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }], ['path', { d: 'm9 12 2 2 4-4' }]] },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof icons;
export const getIcon = (name: IconName): IconDefinition => icons[name];
