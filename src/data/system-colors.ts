/** Approved palette and complete source-checked uses; project artwork is excluded. */
export type ColorMode = 'light' | 'dark' | 'both';
export interface ColorUse { mode: ColorMode; roles: string[]; label: string; zone?: 'light'; shade?: string; }
export interface PaletteColor { name: string; token: string; stripText?: 'color-white'; uses: ColorUse[]; shades?: {token:string}[]; }
const use=(mode:ColorMode,label:string,...roles:string[]):ColorUse=>({mode,label,roles});
export const paletteColors:PaletteColor[]=[
 {name:'White',token:'color-white',uses:[use('light','Cards and surfaces','color-bg-surface'),use('light','Text on dark buttons','color-text-on-primary'),{...use('both','Popups','color-bg-surface'),zone:'light'}]},
 {name:'Paper',token:'color-paper',uses:[use('light','Page','color-bg-canvas'),use('dark','Text','color-text-primary'),{...use('dark','Secondary text · 64%','color-text-secondary'),shade:'color-paper-64'}],shades:[{token:'color-paper-64'},{token:'color-paper-10'},{token:'color-paper-8'}]},
 {name:'Mist',token:'color-mist',uses:[use('light','Hover fills','color-bg-surface-subtle')]},
 {name:'Stone',token:'color-stone',uses:[use('dark','Button hover, rain icons','color-text-primary-hover','color-rain-icon')]},
 {name:'Silver',token:'color-silver',uses:[use('light','Footer icons','color-footer-icon')]},
 {name:'Pewter',token:'color-pewter',stripText:'color-white',uses:[use('dark','Footer icons','color-footer-icon')]},
 {name:'Graphite',token:'color-graphite',uses:[use('light','Button hover','color-text-primary-hover'),use('dark','Hover fills','color-bg-surface-subtle')]},
 {name:'Charcoal',token:'color-charcoal',uses:[use('dark','Cards and surfaces','color-bg-surface')]},
 {name:'Ink',token:'color-ink',uses:[use('light','Text, rain icons, Work and About','color-text-primary','color-rain-icon','color-bg-section'),{...use('light','Secondary text · 64%','color-text-secondary'),shade:'color-ink-64'},use('dark','Page','color-bg-canvas'),use('dark','Text on light buttons','color-text-on-primary')],shades:[{token:'color-ink-64'},{token:'color-ink-16'},{token:'color-ink-8'}]},
 {name:'Night',token:'color-night',uses:[use('dark','Work and About','color-bg-section')]},
 {name:'Orange',token:'color-orange',uses:[use('light','Accent','color-interactive-accent')]},
 {name:'Orange light',token:'color-orange-light',uses:[use('dark','Accent','color-interactive-accent')]},
];
/** A derived role stays separate from the named primitive palette. */
export const accentSubtleColor:PaletteColor={name:'Accent tint',token:'color-bg-accent-subtle',uses:[
 use('both','Accent chips'),
 use('both','Decision cards and Hooko','color-bg-accent-subtle'),
 use('both','Spacing, layout and motion demos'),
]};
export const colorCards=[...paletteColors,accentSubtleColor];
export const colorRoles=['color-bg-accent-subtle','color-text-primary','color-text-secondary','color-text-primary-hover','color-bg-canvas','color-bg-surface','color-bg-surface-subtle','color-border-default','color-interactive-accent','color-bg-section','color-video-track','color-rain-icon','color-footer-icon','color-text-on-primary','color-border-control','color-focus-ring'];
export const strokeCards=[
 {name:'Borders',description:'Dividers, card outlines, tags, dot grid',role:'color-border-default',demo:'border'},
 {name:'Button outlines',description:'Outlined buttons and icon buttons',role:'color-border-control',demo:'button'},
 {name:'Focus ring',description:'Keyboard focus on every control',role:'color-focus-ring',demo:'focus'},
 {name:'Video bar',description:'Video progress track',role:'color-video-track',demo:'video'},
] as const;
export const paletteTokenNames=paletteColors.flatMap(color=>[color.token,...(color.shades||[]).map(shade=>shade.token)]);

/** Reviewed external Color contract; local guards verify its body when present. */
export const colorDocumentationReceipt={"section":"Color","sha256":"b4de992bb736398baa7a4d8ed745cb5e78e186fac46372cccee9b53c9142a7f0","characters":7404};
