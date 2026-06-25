// Filler posts = OTHER people in the feed (kept separate from the swappable
// PROFILE, which is only the previewing author). Hardcoded static data, styled
// identically to the real post, so the hook competes for attention the way it
// really will — against the scroll, not in isolation.
//
// Content is shaped like the author's actual feed: AI/LLM takes, startup/founder
// posts, sports-tech, the occasional NHL post, a humblebrag or two.

export interface FillerPost {
  id: string;
  name: string;
  headline: string;
  initials: string;
  avatarHue: number; // fallback color if the photo fails to load
  avatarUrl: string; // headshot
  degree: string; // "1st" | "2nd" | "3rd+"
  reason?: string; // social-proof header, e.g. "Glean commented on this"
  timeAgo: string;
  reactions: number;
  comments: number;
  reposts: number;
  text: string;
  links?: string[]; // substrings rendered as blue entity mentions
  imageUrl?: string; // optional image rendered below the text
  link?: { url: string; title: string }; // optional link-preview card
}

const pravatar = (n: number) => `https://i.pravatar.cc/96?img=${n}`;
const photo = (seed: string, w = 700, h = 380) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const FILLER_POSTS: FillerPost[] = [
  {
    id: "f1",
    name: "Priya Nair",
    headline: "Founder & CEO at Loomwork (YC W24) · Agentic workflows for ops teams",
    initials: "PN",
    avatarHue: 265,
    avatarUrl: pravatar(5),
    degree: "2nd",
    reason: "Marcus Bell loves this",
    timeAgo: "2h",
    reactions: 412,
    comments: 87,
    reposts: 9,
    links: ["Loomwork"],
    text: `Unpopular opinion: most "AI agents" shipping right now are just a for-loop with a system prompt and a vibe.

The hard part was never the LLM call. It's the eval harness, the rollback story, and knowing when NOT to act. We spent 4 months on the boring parts at Loomwork and it's the only reason customers trust us with write access.`,
  },
  {
    id: "f2",
    name: "Marcus Bell",
    headline: "Engineering @ Anthropic · Previously infra @ Stripe",
    initials: "MB",
    avatarHue: 200,
    avatarUrl: pravatar(12),
    degree: "2nd",
    timeAgo: "4h",
    reactions: 1290,
    comments: 203,
    reposts: 64,
    links: ["Anthropic", "Stripe"],
    link: {
      url: "https://www.anthropic.com/research",
      title: "Building reliable retrieval systems for production LLMs",
    },
    text: `The context window stopped being the bottleneck six months ago. Retrieval quality is the bottleneck now.

You can hand a model a million tokens and it'll still confidently answer from the wrong paragraph if your chunking is lazy. Garbage in, eloquent garbage out.`,
  },
  {
    id: "f3",
    name: "Dana Whitfield",
    headline: "VP Product · Sports analytics · ex-Second Spectrum",
    initials: "DW",
    avatarHue: 145,
    avatarUrl: pravatar(9),
    degree: "1st",
    timeAgo: "6h",
    reactions: 88,
    comments: 12,
    reposts: 2,
    imageUrl: photo("hockey-rink"),
    text: `Spent the weekend wiring up player-tracking data to a live win-probability model for beer-league hockey. Yes, beer league. No, nobody asked.

The puck-possession features actually transfer shockingly well from the NHL dataset. Small sample, big nerd energy.`,
  },
  {
    id: "f4",
    name: "Tomás Errázuriz",
    headline: "Solo founder · Building in public · Bootstrapped to $40k MRR",
    initials: "TE",
    avatarHue: 25,
    avatarUrl: pravatar(13),
    degree: "3rd+",
    reason: "Priya Nair commented on this",
    timeAgo: "8h",
    reactions: 2104,
    comments: 311,
    reposts: 140,
    imageUrl: photo("revenue-chart"),
    text: `I almost shut the company down in February.

Three months later we crossed $40k MRR with zero funding and a team of exactly one (me) plus a very patient golden retriever. Here's the unglamorous breakdown of what actually moved the needle 🧵`,
  },
  {
    id: "f5",
    name: "Aisha Rahman",
    headline: "Research Scientist · LLM evaluation · PhD, MILA",
    initials: "AR",
    avatarHue: 320,
    avatarUrl: pravatar(16),
    degree: "2nd",
    timeAgo: "11h",
    reactions: 567,
    comments: 64,
    reposts: 31,
    text: `Reminder that "beats GPT-4 on benchmark X" and "useful in your actual product" are almost completely uncorrelated.

Benchmarks are a starting point, not a finish line. Build your own eval set from your own failure cases. It's tedious. Do it anyway.`,
  },
  {
    id: "f6",
    name: "Greg Solberg",
    headline: "Angel investor · Former GM, NHL front office · Advisor",
    initials: "GS",
    avatarHue: 215,
    avatarUrl: pravatar(33),
    degree: "2nd",
    timeAgo: "14h",
    reactions: 743,
    comments: 156,
    reposts: 22,
    links: ["NHL"],
    text: `Hot take from someone who spent 15 years in hockey ops: the analytics revolution didn't replace the scouts.

It made the good scouts unstoppable and exposed the lazy ones. Same thing is about to happen to every knowledge worker who refuses to learn the new tools.`,
  },
  {
    id: "f7",
    name: "Lena Fischer",
    headline: "Design Lead · Fintech · Writing about craft & taste",
    initials: "LF",
    avatarHue: 290,
    avatarUrl: pravatar(20),
    degree: "3rd+",
    timeAgo: "17h",
    reactions: 934,
    comments: 41,
    reposts: 53,
    imageUrl: photo("clean-ui"),
    text: `The best onboarding flow I've ever seen had exactly one screen.

Everything else the team wanted to add, they earned the right to add later — after the user already felt the value. Restraint is a feature.`,
  },
  {
    id: "f8",
    name: "Devon Carter",
    headline: "Growth @ a Series B you've heard of · Ex-agency",
    initials: "DC",
    avatarHue: 55,
    avatarUrl: pravatar(52),
    degree: "2nd",
    timeAgo: "20h",
    reactions: 156,
    comments: 28,
    reposts: 4,
    text: `Cold email is not dead. Your cold email is dead.

If your first line is "I hope this email finds you well" you've already lost. Lead with a specific, true observation about THEIR business or don't send it.`,
  },
  {
    id: "f9",
    name: "Sofia Mendez",
    headline: "CTO & Co-founder · Infra for ML teams · Hiring",
    initials: "SM",
    avatarHue: 175,
    avatarUrl: pravatar(45),
    degree: "1st",
    timeAgo: "1d",
    reactions: 489,
    comments: 73,
    reposts: 18,
    text: `We deleted 60% of our microservices this quarter and our on-call pages dropped by 80%.

Turns out a "monolith" you can actually reason about beats a constellation of services held together by hope and a Slack channel. Boring tech wins again.`,
  },
  {
    id: "f10",
    name: "Raj Patel",
    headline: "Startup mentor · 3x founder (2 exits, 1 spectacular crater)",
    initials: "RP",
    avatarHue: 5,
    avatarUrl: pravatar(60),
    degree: "2nd",
    reason: "Greg Solberg reposted this",
    timeAgo: "1d",
    reactions: 3201,
    comments: 540,
    reposts: 410,
    text: `Nobody talks about the founder who raised $12M and quietly returned it 18 months later.

That was me. The crater taught me more than either exit did. If you're in the messy middle right now, this one's for you.`,
  },
];

// The previewing author's post is inserted into the feed after this many filler
// posts — far enough down that it has to compete with the scroll above it.
export const MY_POST_INDEX = 4;

// A sensible starter draft so the tool is immediately usable on load.
export const SAMPLE_DRAFT = `A stranger paid for my coffee this morning.

I cried in my car for 20 minutes. Then I closed a $40k deal.

Here's what that barista taught me about B2B sales that my MBA never could 🧵

1/ Generosity compounds. She didn't ask for anything. Neither should your first 5 touchpoints.

2/ Most people are one act of kindness away from saying yes. Your pipeline is no different.

Agree? 🙏 Repost to save someone's quarter.`;
