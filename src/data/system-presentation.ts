import { tooltipFollowTiming } from '../scripts/tooltip.ts';
export const componentPresentation:Record<string,{description:string;hint:string;columns:{title:string;rows:{name:string;detail?:string;token?:string;context?:string;selector?:string;properties?:string}[]}[];rules:string[]}>={
 Tooltip:{description:'Shows a short name beside a tool card.',hint:'Hover to follow the mouse · keyboard focus centres on the tool card',columns:[
 {title:'States',rows:[{name:'Hidden',detail:'At rest and on touch devices.'},{name:'Visible above',detail:'Follows the mouse with shared smoothing.'},{name:'Flipped below',detail:'Moves below the pointer near the top edge.'},{name:'Keyboard focus',detail:'Centred on the tool card.'}]},
 {title:'Sizes',rows:[{name:'Padding',selector:'.tooltip',properties:'padding'},{name:'Radius',token:'radius-full'},{name:'Body/M',selector:'.tooltip',properties:'font-size,line-height'}]},
 {title:'Colors',rows:[{name:'Background',token:'color-bg-surface',context:'.tooltip'},{name:'Text',token:'color-text-primary',context:'.tooltip'}]},
 {title:'Motion',rows:[{name:'Opacity',token:'duration-tooltip-opacity'},{name:'Scale',token:'duration-tooltip-scale'},{name:'Start scale',token:'scale-tooltip-start'},{name:'Follow smoothing',detail:`Exponential follow: ${tooltipFollowTiming.timeConstant}ms time constant, capped at ${tooltipFollowTiming.maxElapsed}ms per step.`}]}],rules:['Use for short tool-card names.','One line, no links inside.','Never the only way to get information; the target keeps its accessible name.','No tooltip on touch.']},
};
