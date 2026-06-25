import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "./profile";
import type { PostDraft } from "./types";
import type { PostCardData } from "./components/PostCard";
import { LinkedInNav } from "./components/LinkedInNav";
import { MobileNav } from "./components/MobileNav";
import { MobileTabBar } from "./components/MobileTabBar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { ComposeScreen } from "./components/ComposeScreen";
import { ProfileSettings } from "./components/ProfileSettings";
import { WidthControls } from "./components/WidthControls";
import { Feed } from "./components/Feed";
import { computeHook } from "./measurer";
import { parseMentions, displayLength } from "./segments";
import {
  PRESETS,
  DEFAULT_PRESET_ID,
  cardWidthFor,
  windowToTextWidth,
  SIDEBAR_MIN_WIDTH,
  LAYOUT_CSS_VARS,
} from "./constants";
import { SAMPLE_DRAFT } from "./data";
import { loadState, saveState } from "./storage";
import { PencilIcon } from "./components/icons";

const presetWidth = (id: string) =>
  PRESETS.find((p) => p.id === id)?.width ?? PRESETS[0].width;

type Mode = "compose" | "preview";

const persisted = loadState();

// `initialProfile` (from PROFILE) is the seed; once edited, the live profile is
// React state, persisted to localStorage. The Profile shape never changes, so
// the rest of the tree is untouched.
export function App({ initialProfile }: { initialProfile: Profile }) {
  const [mode, setMode] = useState<Mode>("compose");
  const [profile, setProfile] = useState<Profile>(persisted?.profile ?? initialProfile);
  const [draft, setDraft] = useState<PostDraft>(persisted?.draft ?? { text: SAMPLE_DRAFT });
  const [posted, setPosted] = useState<PostDraft | null>(persisted?.posted ?? null);
  const [autoFormatMentions, setAutoFormatMentions] = useState<boolean>(
    persisted?.settings?.autoFormatMentions ?? true
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Phone-sized real viewport: the desktop-width preview can't fit a 3-column
  // shell here, so we fall back to a sideways-scrollable single card (below).
  const [narrowViewport, setNarrowViewport] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches
  );

  const [textWidth, setTextWidth] = useState(presetWidth(DEFAULT_PRESET_ID));
  const [activePresetId, setActivePresetId] = useState<string | null>(DEFAULT_PRESET_ID);
  const [matchWindow, setMatchWindow] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);

  const myPostRef = useRef<HTMLDivElement>(null);

  // Persist profile + draft + posted across sessions.
  useEffect(() => {
    saveState({ profile, draft, posted, settings: { autoFormatMentions } });
  }, [profile, draft, posted, autoFormatMentions]);

  // Track whether the real screen is phone-sized (for the desktop-on-mobile view).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setNarrowViewport(mq.matches);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Publish the desktop-shell dimensions (constants.ts) as CSS vars so styles.css
  // reads the same numbers the match-window math does — one source of truth.
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(LAYOUT_CSS_VARS)) {
      root.style.setProperty(name, value);
    }
  }, []);

  // "Match my window": feed the live browser width into textWidth and follow
  // every resize, so the preview is whatever LinkedIn would render on this
  // screen right now. Any preset/drag turns it off (see handlers below).
  useEffect(() => {
    if (!matchWindow) return;
    const apply = () => setTextWidth(windowToTextWidth(window.innerWidth));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [matchWindow]);

  const myPost: PostCardData | null = useMemo(
    () =>
      !posted || posted.text.trim().length === 0
        ? null
        : {
            name: profile.name,
            headline: profile.headline,
            initials: profile.initials ?? "?",
            avatarUrl: profile.avatarUrl,
            timeAgo: "now",
            reactions: 0,
            comments: 0,
            reposts: 0,
            text: posted.text,
            imageUrl: posted.imageDataUrl,
            link: posted.link,
            isMe: true,
          },
    [profile, posted]
  );

  useLayoutEffect(() => {
    if (mode !== "preview" || !posted || posted.text.trim().length === 0) return;
    const { visibleSegments } = computeHook(parseMentions(posted.text), textWidth);
    setVisibleChars(displayLength(visibleSegments));
  }, [posted, textWidth, mode]);

  const handlePreset = (id: string) => {
    setMatchWindow(false);
    setTextWidth(presetWidth(id));
    setActivePresetId(id);
  };
  const handleDrag = (w: number) => {
    setMatchWindow(false);
    setTextWidth(w);
    setActivePresetId(null);
  };
  const toggleMatchWindow = () => {
    setMatchWindow((on) => !on);
    setActivePresetId(null);
  };
  const jumpToMyPost = () =>
    myPostRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const onDraftChange = (patch: Partial<PostDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const onProfileChange = (patch: Partial<Profile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const goPreview = () => {
    setPosted(draft);
    setMode("preview");
  };
  const goEdit = () => setMode("compose");

  const settingsModal = settingsOpen && (
    <ProfileSettings
      profile={profile}
      onChange={onProfileChange}
      onClose={() => setSettingsOpen(false)}
    />
  );

  if (mode === "compose") {
    return (
      <div className="app-shell">
        <ComposeScreen
          profile={profile}
          draft={draft}
          onChange={onDraftChange}
          onPreview={goPreview}
          hasPosted={!!posted && posted.text.trim().length > 0}
          onBackToFeed={() => setMode("preview")}
          onOpenSettings={() => setSettingsOpen(true)}
          autoFormatMentions={autoFormatMentions}
          onToggleAutoFormatMentions={() => setAutoFormatMentions((v) => !v)}
        />
        {settingsModal}
      </div>
    );
  }

  const isDesktop = textWidth >= SIDEBAR_MIN_WIDTH;

  const feed = (
    <Feed
      textWidth={textWidth}
      onDragWidth={handleDrag}
      myPost={myPost}
      myPostRef={myPostRef}
      profile={profile}
      onEdit={goEdit}
    />
  );

  return (
    <div className="app-shell">
      <div className="tool-strip">
        <div className="tool-brand">
          hooked<span className="tool-brand-in">in</span>
        </div>
        <button className="edit-post-btn" type="button" onClick={goEdit}>
          <PencilIcon size={16} /> Edit post
        </button>
        <WidthControls
          textWidth={textWidth}
          activePresetId={activePresetId}
          onPreset={handlePreset}
          matchWindow={matchWindow}
          onToggleMatchWindow={toggleMatchWindow}
          visibleChars={visibleChars}
        />
        <button className="jump-btn" type="button" onClick={jumpToMyPost} disabled={!myPost}>
          ↓ Jump to your post
        </button>
      </div>

      {isDesktop && narrowViewport ? (
        // Desktop-width hook on a phone: the 3-column shell can't fit, but the
        // cut is governed only by text width — so show just the real-width card
        // and let it scroll sideways. Same hook, usable on a small screen.
        <div className="dom-wrap">
          <div className="dom-banner">
            Desktop-width hook · the card is wider than your screen — scroll it sideways →
          </div>
          <div className="dom-scroll">{feed}</div>
        </div>
      ) : isDesktop ? (
        <>
          <LinkedInNav profile={profile} />
          <div className="li-page">
            <LeftSidebar profile={profile} />
            {feed}
            <RightSidebar />
          </div>
        </>
      ) : (
        <div className="m-stage">
          <div className="m-col" style={{ width: cardWidthFor(textWidth) }}>
            <MobileNav profile={profile} onEdit={goEdit} />
            {feed}
            <MobileTabBar />
          </div>
        </div>
      )}
      {settingsModal}
    </div>
  );
}
