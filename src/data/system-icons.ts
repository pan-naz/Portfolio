import {icons, type IconName} from './icons.ts';
import {waterfallIconNodes, waterfallIconManifest} from '../scripts/waterfall/waterfall-icon-data.ts';

/** Each genuine interface glyph has one documentation group. */
export const iconGroups: {title:string;description:string;icons:IconName[]}[] = [
 {title:'Links',description:'Point to another page or file.',icons:['arrow']},
 {title:'Actions',description:'Open and close.',icons:['plus','close']},
 {title:'Theme',description:'Light and dark switch.',icons:['sun','moon']},
 {title:'Media',description:'Video player controls.',icons:['play','pause','volume','volume-muted']},
 {title:'Marks',description:'Small symbols with a meaning.',icons:['layers','shield-check','equals']},
 {title:'Design system only',description:'Used on these pages, not on the site.',icons:['monitor','tablet','phone']},
];
export const iconLabels: Record<IconName,string> = {arrow:'Arrow',plus:'Plus',close:'Close',sun:'Sun',moon:'Moon',play:'Play',pause:'Pause',volume:'Volume','volume-muted':'Muted',layers:'Layers','shield-check':'Shield',equals:'Equals',monitor:'Monitor',tablet:'Tablet',phone:'Phone'};
export const iconWeights = [
 {name:'Regular',token:'icon-stroke-regular',description:'Theme, volume, layers and most icons.'},
 {name:'Strong',token:'icon-stroke-strong',description:'Plus, close, play, pause, shield, equals and button arrows.'},
 {name:'Emphasis',token:'icon-stroke-emphasis',description:'The small arrow in text links.'},
];
export const decorativeIconNames = ['heart','sparkles','archive','at-sign','award','bell','bookmark','calendar','camera','chart-column','code','compass','image','grid-2x2','link','lock','mail','map-pin','message-circle','mic','music','palette','pen-tool','search','send','settings','star','tag','users','zap','video','rocket','puzzle','pin','lightbulb','flag','feather','eye','download','clock'];
export const decorativeIcons = decorativeIconNames.map(name=>{
 const index=waterfallIconManifest.findIndex(icon=>icon.name===name);
 if(index<0)throw Error('Unknown decorative icon: '+name);
 return {name,nodes:waterfallIconNodes[index]};
});
export const decorativeIconCount = waterfallIconNodes.length;
export const coverIcons = decorativeIcons.slice(0,18);
export const interfaceIconNames = Object.keys(icons) as IconName[];
