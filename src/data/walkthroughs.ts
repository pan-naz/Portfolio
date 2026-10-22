import type { WalkthroughCue } from '../scripts/walkthrough';
interface WalkthroughData { src: string; poster: string; lengthSeconds: number; cues: WalkthroughCue[]; }
export const walkthroughs: Record<string, WalkthroughData> = {
  datagpt: {
    src: '/projects/datagpt-case-study/walkthrough.mp4',
    poster: '/projects/datagpt-case-study/walkthrough-poster.jpg',
    lengthSeconds: 362.218,
    cues: [
      {name:'Overview',anchor:'top',start:0},
      {name:'Problem',anchor:'#dg-problem',start:18.1},
      {name:'Discovery & Research',anchor:'#dg-research',start:56.5},
      {name:'Competitor mapping',anchor:'#dg-competitors',start:106.6},
      {name:'Prototypes',anchor:'#dg-models',start:164.8},
      {name:'What shipped?',anchor:'#dg-shipped',start:193.9},
      {name:'Pilot launch',anchor:'#dg-pilot',start:226.5,stops:[
        {anchor:'#dg-pilot-problem-one',start:232.6},
        {anchor:'#dg-llm-instructions',start:255.5},
        {anchor:'#dg-pilot-problem-two',start:293.9},
      ]},
      {name:'Impact',anchor:'#dg-impact',start:326.8},
      {name:'Website',anchor:'#dg-website',start:341.7},
      {name:'Conclusion',anchor:'#dg-conclusion',start:345.5},
    ],
  },
};
