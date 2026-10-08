// Exact source narrative and original Design Cup artwork from the supplied artifact.
export const designCupDescription = "Landing page for Design Cup, a concept competition for beginner and experienced interface designers, run by Mail and Skillbox." as const;

export const designCupTags = [
  "Landing page",
  "Visual identity",
  "Branding"
] as const;

export const designCupRole = {
  "title": "Designer",
  "items": [
    "Concept",
    "Visual identity",
    "Branding",
    "Landing page"
  ]
} as const;

export const designCupHero = {
  "src": "/projects/design-cup-case-study/hero.webp",
  "alt": "The first screen of the landing page: a wireframe landscape under a setting sun, then the chrome @ Design Cup title, the dates, the Participate button and the Skillbox and Mail logos appear one after another",
  "width": 1200,
  "height": 600,
  "kind": "image",
  "reducedMotionSrc": "/projects/design-cup-case-study/hero-still.webp",
  "canvasColor": "linear-gradient(#FB06B5, #FB06B5) right bottom / 50% 7.5% no-repeat, #EDFFFE",
  "canvasSourceRatio": 1.3333333333333333
} as const;

export const designCupPage = {
  "eyebrow": "Landing page",
  "title": "Page structure",
  "description": "Under the first screen, the page has six blocks: what the competition is, its stages, the prizes, the jury, a second sign-up and the organizers with the footer.",
  "media": {
    "src": "/projects/design-cup-case-study/landing.gif",
    "alt": "The whole landing page in a tilting browser window: the first screen, the About block with the numbers, the Offline Battle timeline, the Loot block with the prizes, the jury carousel, the sign-up block with participants' photos, the organizers and the footer, then the first screen again",
    "width": 800,
    "height": 600,
    "kind": "image",
    "reducedMotionSrc": "/projects/design-cup-case-study/hero-still.webp"
  }
} as const;

export const designCupJury = {
  "eyebrow": "Jury",
  "title": "Jury portraits",
  "description": "The block title, “And who are the judges?”, is a line from Griboyedov’s play Woe from Wit. Five art directors and designers judged the entries, each shown as a portrait in the page’s colours. The arrows move the carousel.",
  "media": {
    "src": "/projects/design-cup-case-study/jury.gif",
    "alt": "The jury carousel: illustrated portraits of the jury members on pink, orange and blue shapes slide from right to left, each with a name and a studio under it",
    "width": 800,
    "height": 600,
    "kind": "image",
    "reducedMotionSrc": "/projects/design-cup-case-study/jury-still.webp",
    "canvasColor": "#030408",
    "canvasFade": true
  }
} as const;

export const designCupEnding = [
  {
    "title": "Second sign-up",
    "description": "Near the end, the title comes back with participants’ photos around it and a second Participate button. The line under it plays on the Russian pangram from font previews, “Eat some more of these soft French rolls”, and adds “and take the damn prizes!”",
    "media": {
      "src": "/projects/design-cup-case-study/signup-still.webp",
      "alt": "The sign-up block: the @ Design Cup title in the middle with participants' round photos and two plus buttons around it, and a violet Participate button",
      "width": 800,
      "height": 600,
      "kind": "image",
      "reducedMotionSrc": "/projects/design-cup-case-study/signup-still.webp",
      "animationSrc": "/projects/design-cup-case-study/signup.webp"
    }
  },
  {
    "title": "Organizers and footer",
    "description": "The last block, “Who’s paying for this banquet?”, names the organizers, Mail and Skillbox, next to four numbers: 10 weeks, 2 stages with tasks from big companies, x10 growth and 100% out of the comfort zone. The footer links to the rules, news, past editions and the community pages.",
    "media": {
      "src": "/projects/design-cup-case-study/organizers-still.webp",
      "alt": "The organizers block with the Mail and Skillbox logos and four numbers in pink, then the footer with social icons and links",
      "width": 800,
      "height": 600,
      "kind": "image",
      "reducedMotionSrc": "/projects/design-cup-case-study/organizers-still.webp",
      "animationSrc": "/projects/design-cup-case-study/organizers.webp"
    }
  }
] as const;

export const designCupGuide = {
  "eyebrow": "Style guide",
  "title": "Visual identity",
  "description": "The look comes from 80s arcade games and synthwave covers: a wireframe landscape under a setting sun, chrome lettering, and neon colours on black.",
  "lettering": {
    "title": "Lettering",
    "description": "The title and dates from the first screen.",
    "media": {
      "src": "/projects/design-cup-case-study/lettering.webp",
      "alt": "The @ Design Cup title and the dates 17 to 2 in chrome lettering that goes from yellow to pink, over the landscape",
      "width": 476,
      "height": 138,
      "kind": "image"
    }
  },
  "coloursTitle": "Colours",
  "coloursDescription": "Measured from the page.",
  "colours": [
    {
      "name": "Black",
      "description": "Page background",
      "value": "#000105"
    },
    {
      "name": "Pink",
      "description": "Title and numbers",
      "value": "#FB06B5"
    },
    {
      "name": "Violet",
      "description": "Buttons and arrows",
      "value": "#4C1AD3"
    },
    {
      "name": "Cyan",
      "description": "Numbers and dates",
      "value": "#02E5FB"
    },
    {
      "name": "Yellow",
      "description": "Chrome lettering",
      "value": "#FDE406"
    },
    {
      "name": "Orange",
      "description": "The @ mark",
      "value": "#FF9400"
    }
  ]
} as const;

