export const site = {
  name: "Ben Cully",
  role: "Software developer",
  location: "Chicago",
  since: "2007",
  url: "https://bencully.com",
  github: "https://github.com/BenCully",
  githubLabel: "github.com/BenCully",
  lede: "I write software in Chicago. I've been making things since 2007.",
  about: [
    "The projects on this page are the public ones. Most of the software I work on stays in private repositories.",
    "GitHub is the best way to reach me. I'm open to hearing about interesting work.",
  ],
} as const

export const projects = [
  {
    name: "Vampire Survivors Evolution Finder",
    summary:
      "Offline search over the evolution chart: weapons, passives, evolved items, and 224 characters, with recipe previews and a zoomable chart.",
    language: "JavaScript",
    year: "2026",
    href: "https://github.com/BenCully/vampire-survivors-ocr-search",
  },
  {
    name: "Discord chatbot",
    summary: "A Discord bot that can target specific usernames.",
    language: "JavaScript",
    year: "2019",
    href: "https://github.com/BenCully/discordchatbot",
  },
  {
    name: "Battleship AI",
    summary: "Battleship, with machine learning.",
    language: "Python",
    year: "2018",
    href: "https://github.com/BenCully/battleshipAI",
  },
] as const
