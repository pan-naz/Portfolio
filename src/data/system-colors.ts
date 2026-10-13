/** Approved palette order and source-checked uses; project artwork is excluded. */
export type ColorMode = 'light' | 'dark' | 'both';
export interface ColorUse { mode: ColorMode; roles: string[]; label: string; zone?: 'light'; }
export interface PaletteColor { name: string; token: string; stripText?: 'color-white'; uses: ColorUse[]; shades?: {token:string;percent:number;use:ColorUse}[]; }
const use=(mode:ColorMode,label:string,...roles:string[]):ColorUse=>({mode,label,roles});
export const paletteColors:PaletteColor[]=[
 {name:'White',token:'color-white',uses:[use('light','Cards and surfaces','color-bg-surface','color-bg-raised'),{...use('both','Popups','color-bg-surface'),zone:'light'}]},
 {name:'Paper',token:'color-paper',uses:[use('light','Page','color-bg-canvas'),use('dark','Text','color-text-primary')],shades:[{token:'color-paper-64',percent:64,use:use('dark','Secondary text','color-text-secondary')},{token:'color-paper-10',percent:10,use:use('dark','Video bar','color-video-track')},{token:'color-paper-6',percent:6,use:use('dark','Lines','color-border-default')}]},
 {name:'Mist',token:'color-mist',uses:[use('light','Hover fills','color-bg-surface-subtle','color-bg-raised-hover')]},
 {name:'Stone',token:'color-stone',uses:[use('dark','Button hover, hero icons','color-text-primary-hover','waterfall-icon-color')]},
 {name:'Silver',token:'color-silver',uses:[use('light','Footer icons','footer-pile-icon-color')]},
 {name:'Pewter',token:'color-pewter',stripText:'color-white',uses:[use('dark','Footer icons','footer-pile-icon-color')]},
 {name:'Graphite',token:'color-graphite',uses:[use('light','Button hover','color-text-primary-hover'),use('dark','Menu hover','color-bg-raised-hover')]},
 {name:'Smoke',token:'color-smoke',uses:[use('dark','Hover fills','color-bg-surface-subtle')]},
 {name:'Charcoal',token:'color-charcoal',uses:[use('dark','Project cards, menu','color-bg-raised')]},
 {name:'Ink',token:'color-ink',uses:[use('light','Text, hero icons, Work and About','color-text-primary','waterfall-icon-color','color-section-bg-surface'),use('dark','Page','color-bg-canvas')],shades:[{token:'color-ink-64',percent:64,use:use('light','Secondary text','color-text-secondary')},{token:'color-ink-16',percent:16,use:use('light','Video bar','color-video-track')},{token:'color-ink-6',percent:6,use:use('light','Lines','color-border-default')}]},
 {name:'Night',token:'color-night',uses:[use('dark','Surfaces, Work and About','color-bg-surface','color-section-bg-surface')]},
 {name:'Orange',token:'color-orange',uses:[use('light','Accent','color-interactive-accent')]},
 {name:'Orange light',token:'color-orange-light',uses:[use('dark','Accent','color-interactive-accent')]},
];
export const pageColorRoles=['color-text-primary','color-text-secondary','color-text-primary-hover','color-bg-canvas','color-bg-surface','color-bg-surface-subtle','color-bg-raised','color-bg-raised-hover','color-border-default','color-interactive-accent','color-section-bg-surface','color-video-track','waterfall-icon-color','footer-pile-icon-color'];
export const componentColorRoles=['color-text-on-primary','control-border','focus-ring'];
export const paletteTokenNames=paletteColors.flatMap(color=>[color.token,...(color.shades||[]).map(shade=>shade.token)]);
