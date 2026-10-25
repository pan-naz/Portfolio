import type { WalkthroughCue } from '../scripts/walkthrough';
interface WalkthroughData { src: string; poster: string; lengthSeconds: number; cues: WalkthroughCue[]; }
export const walkthroughs: Record<string, WalkthroughData> = {
  datagpt: {
    src: '/projects/datagpt-case-study/walkthrough.mp4',
    poster: '/projects/datagpt-case-study/walkthrough-poster.jpg',
    lengthSeconds: 399.103,
    cues: [
      {name:'Overview',anchor:'top',start:0,stops:[{anchor:'#dg-overview',start:4.8}]},
      {name:'Problem',anchor:'#dg-problem',start:15.5},
      {name:'Discovery & Research',anchor:'#dg-research',start:41.9,stops:[
        {anchor:'#dg-research-findings',start:49.9},
        {anchor:'#dg-research-personas',start:85.8},
      ]},
      {name:'Competitor mapping',anchor:'#dg-competitors',start:105.9,glide:true},
      {name:'Prototypes',anchor:'#dg-models',start:162.5,stops:[{anchor:'#dg-models',start:170.4,glide:true}]},
      {name:'What shipped?',anchor:'#dg-shipped',start:206.0,glide:'#dg-shipped-navigator',stops:[
        {anchor:'#dg-shipped-navigator',start:213.5,align:'center'},
        {anchor:'#dg-shipped-navigator',start:225.3,align:'center',glide:true},
      ]},
      {name:'Pilot launch',anchor:'#dg-pilot',start:229.0,stops:[
        {anchor:'#dg-pilot-problem-one',start:239.3},
        {anchor:'#dg-llm-instructions',start:265.8},
        {anchor:'#dg-pilot-results-one',start:291.9},
        {anchor:'#dg-pilot-problem-two',start:305.5},
        {anchor:'#dg-pilot-results-two',start:336.5},
      ]},
      {name:'Impact',anchor:'#dg-impact',start:342.4},
      {name:'Website',anchor:'#dg-website',start:370.6},
      {name:'Conclusion',anchor:'#dg-conclusion',start:380.8},
    ],
  },
};
