// Original narrative and media from the supplied artifact; metadata follows approved edits.
export const telegramDescription = "Winner of the Telegram design competition." as const;

export const telegramTags = [
  "Android",
  "Interaction design",
  "Principle",
  "After Effects"
] as const;

export const telegramHero = {
  "src": "/projects/telegram-file-picker-case-study/hero.mp4",
  "alt": "The redesigned Telegram for Android: the attachment menu with two photos selected slides down to the group chat, then opens again over the chat",
  "width": 1440,
  "height": 900,
  "kind": "video",
  "poster": "/projects/telegram-file-picker-case-study/hero.jpg"
} as const;

export const telegramCompetition = {
  "eyebrow": "Brief",
  "title": "The competition",
  "description": [
    "Telegram held a competition for UI designers, with $15,000 in prizes. The task was to redesign the chat screen and the attachment menu of the Android app, with the focus on sharing photos and videos. My entry made the top 15 and won $1,000.",
    "Entries were judged on simplicity, usability and consistency. Telegram later posted my video on its Telegram Designers channel."
  ],
  "statsLabel": "Competition in numbers",
  "stats": [
    {
      "title": "Prize pool",
      "value": "$15,000",
      "description": "Shared among the winners"
    },
    {
      "title": "Result",
      "value": "Top 15",
      "description": "Picked by Telegram from all the entries"
    },
    {
      "title": "My prize",
      "value": "$1,000",
      "description": "Sent by Telegram after the results"
    },
    {
      "title": "Reach",
      "value": "525K",
      "description": "Views on Telegram’s post announcing the competition"
    }
  ]
} as const;

export const telegramEntry = {
  "eyebrow": "Entry",
  "title": "The video",
  "description": "The video I sent to Telegram: the chat list, a group chat with voice messages, and the new attachment menu for photos, videos, files, music and location.",
  "media": {
    "src": "/projects/telegram-file-picker-case-study/entry.mp4",
    "alt": "Screen recording of the redesigned Telegram for Android, 1 minute 56 seconds",
    "width": 1440,
    "height": 900,
    "kind": "video",
    "poster": "/projects/telegram-file-picker-case-study/poster.jpg",
    "controls": true,
    "audioControls": true
  }
} as const;

export const telegramResult = {
  "eyebrow": "Result",
  "title": "Message from Telegram",
  "description": "After the results came out, Telegram support wrote to me and asked for my bank details to send the prize.",
  "media": {
    "src": "/projects/telegram-file-picker-case-study/support.png",
    "alt": "Telegram desktop chat with Telegram support: a message that says Congratulations on winning the designers competition, with a link to the winners post on the Telegram Designers channel, and asks for bank account details. The chat list on the left is blurred.",
    "width": 2302,
    "height": 1472,
    "kind": "image"
  }
} as const;
