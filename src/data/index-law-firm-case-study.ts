const asset = (name: string) => "/projects/index-law-firm-case-study/" + name;
const image = (name: string, width: number, height: number, alt: string) => ({ src: asset(name), width, height, alt, kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const });
const video = (name: string, width: number, height: number, alt: string) => ({ src: asset(name + '.mp4'), poster: asset(name + '.jpg'), width, height, alt, presentation: 'floating' as const, radius: 'medium' as const });

export const indexLawFirmTileOrder = ['consult', 'clients', 'tie', 'draft', 'court', 'scales', 'staff', 'aid', 'arguments', 'state', 'business', 'skovoroda', 'money', 'copyright', 'kant', 'blank'] as const;

export const indexLawFirmDescription = "A website for Index, a law firm in Ivano-Frankivsk, Ukraine. The firm gives legal advice, drafts documents and represents people and companies in court.";
export const indexLawFirmHomeSections = [
  [
    "Header",
    "Menu, phone number, social links and the EN / UA switch, with the logo in the middle. When you scroll, the header sticks to the top and the logo becomes the name in a dark block."
  ],
  [
    "Slider",
    "Photos of the city at sunset with short lines about the firm, such as “Skilled assistance” and “Individual approach”."
  ],
  [
    "Services",
    "Eight service tiles mixed with photos, quotes and two numbers: 2600 clients and 97 staff members."
  ],
  [
    "Partners",
    "A slider with the logos of companies that work with the firm."
  ],
  [
    "Project support",
    "The firm's free legal help for people on low incomes, with the bank details for donations."
  ],
  [
    "Contact",
    "A map, the office address, phone numbers and email."
  ],
  [
    "Footer",
    "The logo, social links and the studio credit."
  ]
] as const;
export const indexLawFirmServices = [
  {
    "id": "consult",
    "description": "Advice on legal issues and written notes based on current law.",
    "items": [],
    "title": "Consulting",
    "summary": "Advice on legal issues and written notes on current law",
    "row": "1",
    "column": "1"
  },
  {
    "id": "draft",
    "description": "Complaints and other legal documents.",
    "items": [
      "Letters and appeals to public authorities",
      "Letters and applications to local governments",
      "Letters and applications to law enforcement",
      "Letters and applications to other authorities and institutions",
      "Complaints about the actions or inaction of officials, to restore violated rights"
    ],
    "title": "Drafting applications",
    "summary": "Complaints and other legal documents",
    "row": "2",
    "column": "2"
  },
  {
    "id": "court",
    "description": "For people, companies and organisations in civil, commercial and administrative courts.",
    "items": [
      "Drafting claims",
      "Family, land and labour cases",
      "Civil, commercial and administrative cases",
      "Debt cases: bank loans, mortgages, contracts and leasing"
    ],
    "title": "Representation in court",
    "summary": "Civil, commercial and administrative cases",
    "row": "2",
    "column": "3"
  },
  {
    "id": "aid",
    "description": "A lawyer for victims, witnesses, suspects and defendants in criminal proceedings.",
    "items": [],
    "title": "Legal aid",
    "summary": "A lawyer in criminal proceedings",
    "row": "3",
    "column": "4"
  },
  {
    "id": "state",
    "description": "For people, companies and organisations at the State Executive Service, the tax office, the Prosecutor's Office and the National Police.",
    "items": [],
    "title": "Representation in state bodies",
    "summary": "Tax office, prosecutors and police",
    "row": "4",
    "column": "2"
  },
  {
    "id": "business",
    "description": "For companies and individual entrepreneurs.",
    "items": [
      "Registering a business and legal support for its work",
      "Advice on legal issues for managers and staff",
      "Legal service on a subscription",
      "Legal documents, job descriptions and standard contracts"
    ],
    "title": "Legal service for businesses",
    "summary": "Companies and individual entrepreneurs",
    "row": "4",
    "column": "3"
  },
  {
    "id": "money",
    "description": "Collecting money from other people and companies.",
    "items": [
      "Negotiating with debtors or creditors before going to court",
      "Working with banks on debt restructuring",
      "Representation in courts and other bodies",
      "Support while court decisions are enforced"
    ],
    "title": "Financial and economic issues",
    "summary": "Debt collection from people and companies",
    "row": "5",
    "column": "1"
  },
  {
    "id": "copyright",
    "description": "Confidential information and trade secrets.",
    "items": [
      "Advice on protecting copyright, confidential information and trade secrets",
      "Regulations, instructions, contracts and orders that protect them",
      "Representation in court to restore violated rights",
      "Support while court decisions are enforced, with the State Executive Service",
      "Working with law enforcement to bring offenders to justice"
    ],
    "title": "Copyright protection",
    "summary": "Confidential information and trade secrets",
    "row": "5",
    "column": "2"
  }
] as const;
export const indexLawFirmPalette = [
  [
    "Main colour",
    "#222222"
  ],
  [
    "UI elements and hover",
    "#FF9600"
  ],
  [
    "Background",
    "#F5F5F5"
  ]
] as const;
export const indexLawFirmMedia = {
  hero: image("intro.jpg", 1000, 440, "Site intro: the Index logo builds up, then the header and the city photo slider appear"),
  home: image("home.jpg", 1000, 2747, "Full Index main page in Ukrainian: header with logo, city sunset slider, service tiles with photos and orange number tiles, a service card open on the left, partner logos, project support with PrivatBank details, map and contacts"),
  laptop: image("laptop.jpg", 1120, 860, "The main page on a laptop: header, city slider and the first service tiles"),
  phones: image("phones.jpg", 1000, 1110, "Three phones: the dark header with the slider, the 2600 clients tile above a service tile, and the contacts with the footer"),
  phoneClose: image("iso.jpg", 1050, 923, "Close view of the phone layout: dark header with the menu button, the slider and stacked service tiles"),
  heroVideo: { src: asset("intro.mp4"), poster: asset("intro.jpg"), width: 1000, height: 440, alt: "Site intro: the Index logo builds up, then the header and the city photo slider appear" },
  scroll: video("scroll", 1366, 562, "Screen recording of the English main page: the logo intro, the city slider, the service tiles with one card opened, partners, contacts and the footer"),
  grid: video("grid", 970, 1032, "Animation of the 12-column grid: column blocks slide in on a dark background"),
};
