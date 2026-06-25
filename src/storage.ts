// localStorage persistence — survives across sessions/tabs until the user clears
// browser data. (The original build plan avoided storage; this is an explicit
// later addition so profile + draft + previewed post stick around.)

import type { Profile } from "./profile";
import type { PostDraft } from "./types";

const KEY = "hookedin.v1";

export interface PersistedState {
  profile?: Profile;
  draft?: PostDraft;
  posted?: PostDraft | null;
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Most likely the 5MB quota (a large pasted image). Fail soft.
    console.warn("hookedin: could not persist state (storage full?)", e);
  }
}
