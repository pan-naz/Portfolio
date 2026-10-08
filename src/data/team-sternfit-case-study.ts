// Original copy and media from the user-supplied Team Sternfit artifact.
export const sternfitDescription = "A recruiting site for Team Sternfit, the team behind three fitness projects: Motiny, Trainy and Sternfit. Sternfit is a platform where athletes view and share each other’s workout programs." as const;

export const sternfitTags = [
  "Web design",
  "UI/UX",
  "Interaction design"
] as const;

export const sternfitRole = [
  "User flow and wireframes",
  "Loader animation and first screen",
  "Main page and brand pages",
  "Photo selection and treatment",
  "Phone layout"
] as const;

export const sternfitTeam = "I worked with Roy Huang, Co-Founder of Team Sternfit." as const;

export const sternfitHero = {
  "src": "/projects/team-sternfit-case-study/hero.jpg",
  "alt": "The site's first screen on black: three tall panels side by side, Motiny with a round M mark on black, Trainy with a diamond T mark on white and Sternfit with an S mark on black, and a menu bar under them",
  "width": 1400,
  "height": 700,
  "kind": "image",
  "presentation": "floating",
  "radius": "medium"
} as const;

export const sternfitSignature = {
  "src": "/projects/team-sternfit-case-study/signature.mp4",
  "alt": "The S mark and Roy Huang's signature being written above the words Co-Founder",
  "width": 180,
  "height": 58,
  "kind": "video",
  "presentation": "floating",
  "radius": "medium",
  "poster": "/projects/team-sternfit-case-study/signature.jpg"
} as const;

export const sternfitFirstScreen = {
  "title": "Three brands on one screen",
  "description": "The site opens with a short loader: the line “Team up, we train.” between two thin rules on black. Then the three brands appear as tall panels side by side. Pointing at a panel makes it wider, and the menu under the panels leads to each brand’s page.",
  "media": {
    "src": "/projects/team-sternfit-case-study/loader.mp4",
    "alt": "The loader with the line Team up, we train, followed by the Motiny, Trainy and Sternfit panels, each one growing wider in turn",
    "width": 678,
    "height": 396,
    "kind": "video",
    "presentation": "floating",
    "radius": "medium",
    "poster": "/projects/team-sternfit-case-study/loader.jpg"
  }
} as const;

export const sternfitBrands = [
  {
    "title": "Motiny",
    "line": "What motivates you",
    "description": "An old black and white photo of a small child in boxing gloves sparring with a man. The mark is an M inside a circle, ending in an exclamation mark.",
    "media": [
      {
        "src": "/projects/team-sternfit-case-study/photo-kids.jpg",
        "alt": "Old black and white photo of a small child in big boxing gloves facing a kneeling man in gloves",
        "width": 266,
        "height": 375,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      {
        "src": "/projects/team-sternfit-case-study/panel-motiny.jpg",
        "alt": "Motiny panel: the same photo darkened on black, under a white round M mark and the word MOTINY",
        "width": 285,
        "height": 491,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ]
  },
  {
    "title": "Trainy",
    "line": "Team up, we train",
    "description": "A trainer stretching a woman’s leg, as a silhouette on white. Trainy is the only white panel of the three. The mark is a T inside a diamond, drawn with double lines.",
    "media": [
      {
        "src": "/projects/team-sternfit-case-study/photo-trainer.jpg",
        "alt": "Silhouette of a trainer in a blue shirt holding up the leg of a woman lying on a balance ball, on white",
        "width": 286,
        "height": 296,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      {
        "src": "/projects/team-sternfit-case-study/panel-trainy.jpg",
        "alt": "Trainy panel: the silhouette in grey on white, behind a black double-line diamond T mark and the word TRAINY",
        "width": 285,
        "height": 491,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ]
  },
  {
    "title": "Sternfit",
    "line": "Be stern, be fit",
    "description": "A fighter kneeing a heavy bag, the same photo as on the site’s cover. The S mark is cut through by a diagonal line and also signs the cover and the footer.",
    "media": [
      {
        "src": "/projects/team-sternfit-case-study/photo-fighter.jpg",
        "alt": "Sepia photo of a muscular fighter with his arms on a heavy bag and one knee raised",
        "width": 475,
        "height": 737,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      {
        "src": "/projects/team-sternfit-case-study/panel-sternfit.jpg",
        "alt": "Sternfit panel: the fighter darkened on black, under a large white S mark and the word STERNFIT",
        "width": 285,
        "height": 491,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ]
  }
] as const;

export const sternfitPhotos = {
  "title": "Other photos",
  "description": "Two more photos were picked for the content pages: a boxer at a bag with red hand wraps and an athlete resting on a bench in the gym.",
  "media": [
    {
      "src": "/projects/team-sternfit-case-study/photo-boxer.jpg",
      "alt": "A boxer with red hand wraps punching a black heavy bag against a dark background",
      "width": 701,
      "height": 452,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/team-sternfit-case-study/photo-gym.jpg",
      "alt": "A muscular woman in a pink sports top sitting on a gym bench with a water bottle, in a dark gym",
      "width": 354,
      "height": 516,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  ]
} as const;

export const sternfitMain = {
  "title": "The story under the first screen",
  "description": "Below the panels, the main page tells how the team started, in five blocks. Each block is a dark photo with a few lines of text in capitals. Two Get in touch buttons lead to the join form.",
  "blocks": [
    {
      "quote": "It all started with a simple idea, can we build something extraordinary, besides getting a job at Wall St?",
      "description": "Two columns of text on either side of a hanging light bulb, then “Seeking epic humans” and the first Get in touch button.",
      "media": {
        "src": "/projects/team-sternfit-case-study/main-idea.jpg",
        "alt": "Block with a light bulb in the dark between two columns of text in capitals, and a Get in touch button with thin lines on both sides below it",
        "width": 855,
        "height": 435,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    },
    {
      "quote": "Turning an idea into reality can seem like magic.",
      "description": "The same line as on the cover, over an athlete gripping a barbell plate. The left half of the photo is blurred to keep the text readable.",
      "media": {
        "src": "/projects/team-sternfit-case-study/main-magic.jpg",
        "alt": "Full-width block with the line Turning an idea into reality can seem like magic on the left and an athlete gripping a barbell plate on the right",
        "width": 855,
        "height": 337,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    },
    {
      "quote": "But the people who make it happen are not magicians, they are humans.",
      "description": "Half of an older man’s face in hard light, with the text in the dark half.",
      "media": {
        "src": "/projects/team-sternfit-case-study/main-humans.jpg",
        "alt": "Block with half of an older man's face lit from the left and a short column of text in the dark half on the right",
        "width": 855,
        "height": 441,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    },
    {
      "quote": "Ideas don’t change the world. Humans that turn ideas into reality do.",
      "description": "Centred lines over sparks, with some of the words in copper. Fainter copies of the lines sit above and below.",
      "media": {
        "src": "/projects/team-sternfit-case-study/main-vision.jpg",
        "alt": "Full-width dark block with sparks behind three centred lines of text, some words in copper",
        "width": 855,
        "height": 337,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    },
    {
      "quote": "Seeking the crazy ones.",
      "description": "The footer has the second Get in touch button, a line about the team, follower counts for Twitter and Facebook, and links to About and the three brand pages.",
      "media": {
        "src": "/projects/team-sternfit-case-study/main-footer.jpg",
        "alt": "Black footer with Seeking the crazy ones, a Get in touch button, a short line about the team, Twitter and Facebook icons with follower counts and links to about, trainy, sternfit and motiny",
        "width": 855,
        "height": 349,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    }
  ]
} as const;

export const sternfitFlow = {
  "title": "From the first screen to the join form",
  "description": "The wireframes follow one visit: the first screen, About, the Motiny, Trainy and Sternfit pages, then the join form. Each brand page has its mark, its line and social links next to a photo. The form asks for a name, an email and two short answers.",
  "media": {
    "src": "/projects/team-sternfit-case-study/flow.jpg",
    "alt": "Grey wireframes in two rows with arrows between them: the first screen, About with a large image and a Get in touch button, the Motiny, Trainy and Sternfit pages with a mark, a line and social icons beside an image, and a form with four numbered fields",
    "width": 1400,
    "height": 555,
    "kind": "image",
    "presentation": "floating",
    "radius": "medium"
  }
} as const;

export const sternfitPhone = {
  "title": "Phone layout",
  "description": "The layout works from 320px wide. On a phone the three panels stack, each as wide as the screen, and the menu moves behind a button at the top right.",
  "media": {
    "src": "/projects/team-sternfit-case-study/phone.jpg",
    "alt": "A white phone lying at an angle, showing the Motiny panel across the full width of the screen with a menu button at the top, and the Trainy panel below it",
    "width": 830,
    "height": 540,
    "kind": "image",
    "presentation": "floating",
    "radius": "medium"
  }
} as const;

export const sternfitGuide = {
  "title": "Type and colours",
  "description": "The site uses two typefaces and three colours. Everything else comes from the black and white photos.",
  "type": [
    {
      "title": "Georgia",
      "description": "Titles and copy, including the TEAMSTERNFIT wordmark on the cover.",
      "media": {
        "src": "/projects/team-sternfit-case-study/type-georgia.jpg",
        "alt": "Georgia specimen: the alphabet in capitals and lower case and the digits, in bold",
        "width": 576,
        "height": 200,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    },
    {
      "title": "Museo Sans 500",
      "description": "Interface elements and copy: the brand names on the panels, the menu, the buttons and the lines in the blocks.",
      "media": {
        "src": "/projects/team-sternfit-case-study/type-museo.jpg",
        "alt": "Museo Sans 500 specimen: the alphabet in capitals and lower case and the digits",
        "width": 514,
        "height": 200,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    }
  ],
  "colours": [
    {
      "label": "Text",
      "value": "#333333",
      "description": "Text on white"
    },
    {
      "label": "Hover",
      "value": "#888888",
      "description": "Links and buttons on hover"
    },
    {
      "label": "Background",
      "value": "#FFFFFF",
      "description": "Page background"
    }
  ]
} as const;

