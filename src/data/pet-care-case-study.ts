// User-approved hero, intro and prizes; remaining copy and media from the supplied Pet Care artifact.
export const petCareDescription = "Winner of a design competition. App concept for pet care." as const;

export const petCareTags = [
  "Mobile app",
  "UI/UX",
  "Interaction design"
] as const;

export const petCareRole = [
  "Research",
  "Wireframes",
  "Interface design",
  "Animations"
] as const;

export const petCareHero = {
  "src": "/projects/pet-care-case-study/hero-static.jpg",
  "alt": "Pet Care app concept: a white phone showing Barsik's health cards beside the Pet Care title on a pink and white background",
  "width": 2800,
  "height": 1486,
  "kind": "image"
} as const;

export const petCareAnimation = {
  "src": "/projects/pet-care-case-study/hero.mp4",
  "alt": "The app's main screen on a tilted phone: the heart rate, temperature, digestion and emotional condition cards lift off the screen and settle back, and the screen switches from Barsik in orange to Uncle Fedor in pink",
  "width": 1200,
  "height": 720,
  "kind": "video",
  "presentation": "floating",
  "poster": "/projects/pet-care-case-study/hero-poster.jpg",
  "canvasColor": "var(--pc-cream)",
  "canvasInset": 6,
  "canvasFade": true,
  "canvasSourceRatio": 1.4
} as const;

export const petCareCompetition = {
  "eyebrow": "Competition",
  "title": "The brief",
  "description": "Design a concept app for pet owners. Scientists have made a chip that sits in a pet’s body and reads hundreds of health parameters, and the app has to show them to the owner. The pet was up to us, and I chose a dog.",
  "stats": [
    {
      "label": "Entries",
      "value": "300",
      "unit": "",
      "note": "Designers took part"
    },
    {
      "label": "Competition",
      "value": "1",
      "unit": "week",
      "note": "Several tasks, with this app as the last one"
    },
    {
      "label": "Deadline for last task",
      "value": "2",
      "unit": "days",
      "note": "To research, design and animate the app"
    },
    {
      "label": "Prize I won",
      "value": "3",
      "unit": "months",
      "note": "Paid internship at AIC, a leading design agency, with accommodation included."
    }
  ],
  "prizes": [
    { "place": "1st place", "title": "3-month internship", "icon": "trophy", "won": true },
    { "place": "2nd place", "title": "MacBook Pro", "icon": "laptop", "won": false },
    { "place": "3rd place", "title": "iPhone Pro", "icon": "smartphone", "won": false }
  ]
} as const;

export const petCareResearch = {
  "eyebrow": "Research",
  "title": "What a dog needs",
  "description": "The two days started with research: what a dog needs to live well, and which signs show the state of its body best.",
  "cards": [
    {
      "title": "Needs",
      "items": [
        "Healthy, balanced food",
        "A home, even for dogs that live outside",
        "Training"
      ],
      "note": ""
    },
    {
      "title": "Main health signs",
      "items": [
        "Body temperature",
        "Heart rate",
        "Digestion",
        "Emotional state"
      ],
      "note": ""
    }
  ]
} as const;

export const petCarePrototype = {
  "eyebrow": "Process",
  "title": "Wireframes",
  "description": "After the research, I started with wireframes of the four main screens: the pet’s main screen, physical data, emotional state and the pet’s needs. The final design keeps this layout.",
  "media": {
    "src": "/projects/pet-care-case-study/wireframes.jpg",
    "alt": "Four grey wireframes of the app: the main screen with a pet card and four sign cards, physical data with a curved category selector and hemoglobin charts, emotional state with a Positive score and three bars, and the needs screen with food satiety and toilet time reminders",
    "width": 1410,
    "height": 530,
    "kind": "image",
    "presentation": "floating"
  }
} as const;

export const petCareMain = {
  "eyebrow": "Pets tab",
  "title": "Main screen",
  "points": [
    {
      "title": "Pet card",
      "description": "Photo, name, breed, age, height and weight. Swiping the card opens the next pet, and the screen changes to that pet’s colour: orange for Barsik, pink for Uncle Fedor."
    },
    {
      "title": "Signs",
      "description": "Heart rate, temperature, digestion and emotional state, each with a status such as Normal, Good or Angry Dog. The Signs Analysis button checks all parameters at once."
    },
    {
      "title": "Tab bar",
      "description": "Physical and Emotional are the two main sections. The button in the centre opens the pet’s needs and collects alerts. More is for secondary features."
    }
  ],
  "media": {
    "src": "/projects/pet-care-case-study/pets.webp",
    "alt": "The main screen: the pet card swipes from Barsik in orange to Uncle Fedor in pink and back, and the whole screen changes colour with it",
    "width": 444,
    "height": 790,
    "kind": "image",
    "presentation": "floating",
    "reducedMotionSrc": "/projects/pet-care-case-study/pets-static.png",
    "canvasColor": "#FFF4E6"
  }
} as const;

export const petCarePhysical = {
  "eyebrow": "Physical tab",
  "title": "Physical data",
  "paragraphs": [
    "The data is split into categories, such as haematological, chemical and renal function, each with an overall score. Swiping the arc at the top switches the category.",
    "Below the arc are the processes in the body at the moment: leukocytes, hemoglobin, erythrocytes, monocytes and more, each with a chart by day."
  ],
  "media": {
    "src": "/projects/pet-care-case-study/physical.webp",
    "alt": "The Physical tab: the arc swipes from Haematological at 76% to Renal Function at 83% and back, and the list of charts scrolls",
    "width": 420,
    "height": 593,
    "kind": "image",
    "presentation": "bare",
    "reducedMotionSrc": "/projects/pet-care-case-study/physical-static.png"
  },
  "cards": {
    "src": "/projects/pet-care-case-study/cards.jpg",
    "alt": "The app's cards laid out on coral: leukocytes and erythrocytes with line charts, hemoglobin and monocytes with charts by day, and small cards for heart rate, temperature, digestive system and emotional condition",
    "width": 2440,
    "height": 1160,
    "kind": "image",
    "presentation": "bare"
  }
} as const;

export const petCareEmotional = {
  "eyebrow": "Emotional tab",
  "title": "Emotional state",
  "paragraphs": [
    "At the top is the dog’s overall mood, here Positive at 81%, with Negative and Neutral on either side. Below it, three bars show pleasure, delight and joy, and further down is the love of master score."
  ],
  "media": {
    "src": "/projects/pet-care-case-study/emotional.jpg",
    "alt": "The Emotional tab: a Positive score of 81% with a smiley face on a curved selector, and three tall bars for Pleasure at 70%, Delight at 79% and Joy at 48%",
    "width": 1400,
    "height": 2100,
    "kind": "image",
    "presentation": "bare"
  }
} as const;

export const petCareNeeds = {
  "eyebrow": "Centre button",
  "title": "The pet’s needs",
  "paragraphs": [
    "Food satiety shows how full the dog is and the split between fats, proteins and carbohydrates. The owner can set a reminder to buy food.",
    "Under Toilet time, the system works out when the dog needs to go out. Each time has a reminder 10 minutes before and a switch to turn it off."
  ],
  "media": {
    "src": "/projects/pet-care-case-study/needs.webp",
    "alt": "The needs screen: food satiety at 47% with fats, proteins and carbohydrates rings, and toilet times at 06:45, 12:30 and 19:45 being switched off and on",
    "width": 460,
    "height": 732,
    "kind": "image",
    "presentation": "bare",
    "reducedMotionSrc": "/projects/pet-care-case-study/needs-static.png"
  }
} as const;

export const petCareGuide = {
  "eyebrow": "Style guide",
  "title": "Colours and type",
  "description": "Four colours make the two gradients in the app. The text is set in SF Pro Display, the iPhone system typeface, in two weights.",
  "colours": [
    {
      "label": "Orange",
      "value": "#FAAC6B",
      "description": "Start of the orange gradient"
    },
    {
      "label": "Coral",
      "value": "#F27477",
      "description": "End of the orange gradient and buttons"
    },
    {
      "label": "Pink",
      "value": "#F15093",
      "description": "Start of the pink gradient"
    },
    {
      "label": "Magenta",
      "value": "#DF42C4",
      "description": "End of the pink gradient"
    }
  ],
  "brand": {
    "title": "Logo and app icon",
    "description": "The dog from the pet card in the app’s pink gradient, with the name to match."
  },
  "type": [
    {
      "title": "SF Pro Display Bold",
      "description": "Pet names, values and buttons.",
      "media": {
        "src": "/projects/pet-care-case-study/type-bold.png",
        "alt": "Three lines of sample text in SF Pro Display Bold",
        "width": 719,
        "height": 212,
        "kind": "image",
        "presentation": "bare"
      }
    },
    {
      "title": "SF Pro Display Regular",
      "description": "Labels, units and statuses.",
      "media": {
        "src": "/projects/pet-care-case-study/type-regular.png",
        "alt": "Three lines of sample text in SF Pro Display Regular",
        "width": 661,
        "height": 212,
        "kind": "image",
        "presentation": "bare"
      }
    }
  ]
} as const;
