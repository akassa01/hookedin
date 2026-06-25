// profile.ts — the ONLY place the previewing author's identity is defined.
//
// Deploying this tool for someone else is a one-object edit here. The shape is
// deliberately the same one a future settings form would populate, so the form
// can feed React state into <App profile={...}> with zero refactor — PROFILE is
// passed DOWN as a prop, never imported deep in the tree.

export interface Profile {
  name: string;
  headline: string;
  avatarUrl?: string; // optional image
  initials?: string; // fallback when no avatarUrl (e.g. "AK")
}

export const PROFILE: Profile = {
  name: "Arman Kassam",
  headline: "Building things · ex-founder · AI, startups & the occasional hockey take",
  initials: "AK",
};
