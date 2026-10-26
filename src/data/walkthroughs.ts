import type { WalkthroughCue } from '../scripts/walkthrough';
interface WalkthroughData { src: string; poster: string; lengthSeconds: number; cues: WalkthroughCue[]; chapterTitles?: 'names'; }
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
        {anchor:'#dg-pilot-comparison',start:309.6,align:'center',comparison:'before'},
        {anchor:'#dg-pilot-comparison',start:325.8,align:'center',comparison:'after'},
        {anchor:'#dg-pilot-results-two',start:336.5},
      ]},
      {name:'Impact',anchor:'#dg-impact',start:342.4},
      {name:'Website',anchor:'#dg-website',start:370.6},
      {name:'Conclusion',anchor:'#dg-conclusion',start:380.8},
    ],
  },
  voximplant: {
    src: '/projects/voximplant-case-study/walkthrough.mp4',
    poster: '/projects/voximplant-case-study/walkthrough-poster.jpg',
    lengthSeconds: 534.207,
    chapterTitles: 'names',
    cues: [
      {name:'Overview',anchor:'top',start:0,stops:[{anchor:'#vox-overview',start:8.2}]},
      {name:'Problem',anchor:'#vox-problem-title',start:26.5},
      {name:'Discovery',anchor:'#vox-discovery-title',start:55.4,stops:[{anchor:'#vox-audience-title',start:59.4}]},
      {name:'Competitors',anchor:'#vox-competitive-title',start:80.1,stops:[
        {anchor:'#vox-competitive-outcomes',start:94.1},
        {anchor:'#vox-kit-meant',start:116.5},
      ]},
      {name:'Ideation',anchor:'#vox-ideation-title',start:125.3,stops:[
        {anchor:'#vox-hypotheses',start:129.8},
        {anchor:'#vox-ia',start:180.5},
        {anchor:'#vox-prototyping',start:195.4},
        {anchor:'#vox-testing-stats',start:209.3},
        {anchor:'#vox-decisions',start:216.5},
      ]},
      {name:'Solution',anchor:'#vox-onboarding',start:235.5,stops:[
        {anchor:'#vox-editor',start:245.6},
        {anchor:'#vox-editing-blocks',start:298.5},
        {anchor:'#vox-scenarios',start:310.2},
        {anchor:'#vox-campaigns',start:317.8},
        {anchor:'#vox-numbers',start:334.9},
      ]},
      {name:'Contact center',anchor:'#vox-contact-title',start:344.7,stops:[
        {anchor:'#vox-live-dashboard',start:364.6,glide:'next'},
        {anchor:'#vox-live-conversations',start:385.1},
        {anchor:'#vox-workspace',start:404.0,glide:'next'},
        {anchor:'#vox-chat-widget',start:419.3},
        {anchor:'#vox-queues',start:435.8,glide:'next'},
        {anchor:'#vox-messaging-history',start:456.5},
        {anchor:'#vox-reports',start:464.1,glide:'next'},
        {anchor:'#vox-design-system',start:485.5},
      ]},
      {name:'Impact',anchor:'#vox-impact-title',start:491.9},
    ],
  },
};
