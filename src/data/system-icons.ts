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
/** Fixed catalog artwork: centres, pixel sizes, alpha and degrees match the approved scatter. */
export const coverIconScatter = [
 {name:'heart',x:0,y:0,size:22,opacity:.9,rotation:-7},
 {name:'sparkles',x:20,y:6,size:24,opacity:.5,rotation:8},
 {name:'archive',x:40,y:1,size:26,opacity:.8,rotation:10},
 {name:'at-sign',x:60,y:7,size:23,opacity:.6,rotation:-5},
 {name:'award',x:80,y:2,size:25,opacity:.9,rotation:4},
 {name:'bell',x:100,y:5,size:21,opacity:.4,rotation:-8},
 {name:'bookmark',x:9,y:46,size:24,opacity:.4,rotation:12},
 {name:'calendar',x:28,y:53,size:22,opacity:.8,rotation:-9},
 {name:'camera',x:47,y:44,size:20,opacity:.6,rotation:7},
 {name:'chart-column',x:66,y:51,size:26,opacity:.9,rotation:-3},
 {name:'code',x:85,y:45,size:18,opacity:.4,rotation:5},
 {name:'compass',x:99,y:52,size:22,opacity:.8,rotation:-12},
 {name:'image',x:1,y:94,size:24,opacity:.9,rotation:11},
 {name:'grid-2x2',x:21,y:100,size:18,opacity:.6,rotation:2},
 {name:'link',x:41,y:92,size:25,opacity:.9,rotation:-10},
 {name:'lock',x:61,y:99,size:23,opacity:.4,rotation:-8},
 {name:'mail',x:81,y:93,size:24,opacity:.8,rotation:9},
 {name:'map-pin',x:98,y:98,size:26,opacity:.6,rotation:4},
] as const;
export const coverIcons = coverIconScatter.map(placement=>({
 ...placement,nodes:decorativeIcons.find(icon=>icon.name===placement.name)!.nodes,
}));
export const interfaceIconNames = Object.keys(icons) as IconName[];
