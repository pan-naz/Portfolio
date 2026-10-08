// Exact OFFF narrative and original recordings from the supplied artifact.
export const offfDescription = "Landing page for the OFFF conference, made for Skillbox. OFFF brings together digital artists, illustrators and designers. It started in Barcelona and travels to other cities." as const;

export const offfTags = [
  "Landing page",
  "Animation",
  "Collage"
] as const;

export const offfHero = {
  "src": "/projects/offf-conference-case-study/hero.mp4",
  "alt": "The first screen of the landing page loading: the letters O, F, F, F appear one by one on a dark page, each filled with a moving collage, then the header, the city and the dates slide in and the Buy ticket button changes colour",
  "width": 2242,
  "height": 1332,
  "kind": "video",
  "poster": "/projects/offf-conference-case-study/hero-still.jpg"
} as const;

export const offfPage = {
  "eyebrow": "Page",
  "title": "Full scroll",
  "description": "The landing page from top to bottom: the OFFF letters, the festival texts, the speakers and the ticket call.",
  "media": {
    "src": "/projects/offf-conference-case-study/page.mp4",
    "alt": "Screen recording of the whole landing page, 42 seconds",
    "width": 2242,
    "height": 1332,
    "kind": "video",
    "poster": "/projects/offf-conference-case-study/hero-still.jpg",
    "controls": true,
    "audioControls": false
  }
} as const;

