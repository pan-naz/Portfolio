import type { Tool } from './portfolio';

export const hookoHero = {
  width: 1200,
  height: 520,
  video: {
    src: '/projects/hooko-case-study/hero.mp4',
    poster: '/projects/hooko-case-study/hero-poster.jpg',
    width: 1320,
    height: 2700,
  },
  back: { src: '/projects/hooko-case-study/hero-back.jpg', width: 925, height: 2104 },
} as const;

export const hookoDemo = {
  src: '/projects/hooko-case-study/demo.mp4?v=e342e9b914ee',
  poster: '/projects/hooko-case-study/demo-poster.jpg?v=e342e9b914ee',
  alt: 'Demo of an analysis in Hooko',
  width: 1320,
  height: 2700,
  presentation: 'floating',
  radius: 'large',
  strokePlacement: 'outside',
  controls: true,
  showTime: false,
} as const;

export const hookoTools: (Tool & { label: string; description: string; iconColor: string })[] = [
  {
    "name": "Claude Code",
    "iconColor": "#D97757",
    "logo": "/projects/hooko-case-study/icons/claude-code.svg",
    "width": 24,
    "height": 24,
    "label": "Build",
    "description": "Wrote the app, backend and integrations with me, from first screen to release builds."
  },
  {
    "name": "Flutter",
    "iconColor": "#02569B",
    "logo": "/projects/hooko-case-study/icons/flutter.svg",
    "width": 24,
    "height": 24,
    "label": "App",
    "description": "The iOS app, with one codebase ready for Android."
  },
  {
    "name": "Gemini API",
    "iconColor": "#8E75B2",
    "logo": "/projects/hooko-case-study/icons/gemini-api.svg",
    "width": 24,
    "height": 24,
    "label": "AI",
    "description": "Watches the video: niche, hook, audio, visuals, pacing, rewrites, caption and hashtags."
  },
  {
    "name": "YouTube Data API",
    "iconColor": "#FF0000",
    "logo": "/projects/hooko-case-study/icons/youtube-data-api.svg",
    "width": 24,
    "height": 24,
    "label": "Examples",
    "description": "Finds real Shorts from the creator's niche that use the suggested hook structure."
  },
  {
    "name": "Supabase",
    "iconColor": "#3FCF8E",
    "logo": "/projects/hooko-case-study/icons/supabase.svg",
    "width": 24,
    "height": 24,
    "label": "Backend",
    "description": "Anonymous users, video upload, the analysis pipeline, daily limits and stored results."
  },
  {
    "name": "RevenueCat",
    "iconColor": "#F2545B",
    "logo": "/projects/hooko-case-study/icons/revenuecat.svg",
    "width": 24,
    "height": 24,
    "label": "Payments",
    "description": "Paywall, subscriptions and in-app purchases."
  },
  {
    "name": "v0",
    "iconColor": "#161715",
    "logo": "/projects/hooko-case-study/icons/v0.svg",
    "width": 24,
    "height": 24,
    "label": "Website",
    "description": "Generated and iterated the hooko.app landing, terms and privacy pages."
  },
  {
    "name": "Vercel",
    "iconColor": "#161715",
    "logo": "/projects/hooko-case-study/icons/vercel.svg",
    "width": 24,
    "height": 24,
    "label": "Hosting",
    "description": "Hosts and deploys hooko.app."
  },
  {
    "name": "App Store + Apple Ads",
    "iconColor": "#0D96F6",
    "logo": "/projects/hooko-case-study/icons/app-store-apple-ads.svg",
    "width": 24,
    "height": 24,
    "label": "Distribution",
    "description": "Release, store listing, ASO and search ads."
  }
];
