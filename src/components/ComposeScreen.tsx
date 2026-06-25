import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { LinkCard } from "./LinkCard";
import { PostCard, type PostCardData } from "./PostCard";
import type { Profile } from "../profile";
import type { PostDraft } from "../types";
import { MAX_POST_CHARS, PRESETS, DESKTOP_TEXT_WIDTH } from "../constants";
import { computeHook } from "../measurer";
import { parseMentions, displayLength } from "../segments";
import { readImageFile } from "../util";
import { CaretDown, GlobeIcon, ImageIcon, LinkIcon, GearIcon, CloseIcon } from "./icons";

interface ComposeScreenProps {
  profile: Profile;
  draft: PostDraft;
  onChange: (patch: Partial<PostDraft>) => void;
  onPreview: () => void;
  // Phone-sized real viewport: no room for the side-by-side live card, and a
  // desktop-width card can't fit anyway, so the live pane is desktop-only.
  narrowViewport: boolean;
  onOpenSettings: () => void;
  autoFormatMentions: boolean;
  onToggleAutoFormatMentions: () => void;
}

// The live card's two representative text widths. The toggle is a coarse
// "does the hook survive on each?" peek — exact widths / shells live in the full
// preview. Mobile is the default: the hook lives or dies on mobile.
type LiveDevice = "mobile" | "desktop";
// Mobile is the default — the hook lives or dies on mobile.
const LIVE_WIDTH: Record<LiveDevice, number> = {
  mobile: PRESETS.find((p) => p.id === "ip-portrait")?.width ?? 380,
  desktop: DESKTOP_TEXT_WIDTH,
};

// The focused "simple screen": write/paste the draft, attach an image and/or a
// link preview, then jump to the feed preview.
export function ComposeScreen({
  profile,
  draft,
  onChange,
  onPreview,
  narrowViewport,
  onOpenSettings,
  autoFormatMentions,
  onToggleAutoFormatMentions,
}: ComposeScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [liveDevice, setLiveDevice] = useState<LiveDevice>("mobile");
  // Caret position to restore after a programmatic text edit. The textarea is
  // controlled, so React rerenders before we can set selection — stash it here
  // and apply it once the new value has landed (useLayoutEffect below).
  const pendingCaret = useRef<number | null>(null);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  useLayoutEffect(() => {
    if (pendingCaret.current != null && textRef.current) {
      textRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [draft.text]);

  // Auto-pairing for @mentions: typing "@" inserts "@[]" with the caret between
  // the brackets; an immediate Backspace on the empty pair drops back to a bare
  // "@" (escape hatch for a literal @); typing "]" types over the auto-inserted
  // one instead of doubling it.
  const onTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autoFormatMentions || e.metaKey || e.ctrlKey || e.altKey) return;
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const v = draft.text;

    if (e.key === "@") {
      e.preventDefault();
      const selected = v.slice(start, end);
      const next = v.slice(0, start) + "@[" + selected + "]" + v.slice(end);
      // Caret inside the brackets (after any wrapped selection).
      pendingCaret.current = start + 2 + selected.length;
      onChange({ text: next });
      return;
    }

    if (e.key === "Backspace" && start === end) {
      // Caret sits in an empty pair: ...@[|]... → leave a bare "@".
      if (v.slice(start - 2, start) === "@[" && v[start] === "]") {
        e.preventDefault();
        const next = v.slice(0, start - 1) + v.slice(start + 1);
        pendingCaret.current = start - 1;
        onChange({ text: next });
      }
      return;
    }

    if (e.key === "]" && start === end && v[start] === "]") {
      // Type over the auto-inserted closing bracket instead of adding another.
      // Text is unchanged, so move the caret directly (no rerender to wait on).
      e.preventDefault();
      ta.setSelectionRange(start + 1, start + 1);
    }
  };

  const count = draft.text.length;
  const over = count > MAX_POST_CHARS;
  const empty = draft.text.trim().length === 0 && !draft.imageDataUrl && !draft.link;

  // The live card mirrors a posted card (same engine, same chrome) but is fixed
  // to the toggle's width and always collapsed — "is my hook right?" at a glance.
  const liveWidth = LIVE_WIDTH[liveDevice];
  const livePost: PostCardData = {
    name: profile.name,
    headline: profile.headline,
    initials: profile.initials ?? "?",
    avatarUrl: profile.avatarUrl,
    timeAgo: "now",
    reactions: 0,
    comments: 0,
    reposts: 0,
    text: draft.text,
    imageUrl: draft.imageDataUrl,
    link: draft.link,
    isMe: true,
  };

  // Above-the-fold readout for the live width — the same cut the card draws.
  const fold = useMemo(() => {
    const hook = computeHook(parseMentions(draft.text), liveWidth);
    return { chars: displayLength(hook.visibleSegments), truncated: hook.truncated };
  }, [draft.text, liveWidth]);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange({ imageDataUrl: await readImageFile(file) });
    e.target.value = "";
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    onChange({ link: { url: linkUrl.trim(), title: linkTitle.trim() } });
    setLinkUrl("");
    setLinkTitle("");
    setShowLink(false);
  };

  return (
    <div className="compose-screen">
      <div className="compose-stage">
        <div className="compose-main">
          <div className="compose-brandbar">
            <div className="tool-brand">
              hooked<span className="tool-brand-in">in</span>
            </div>
          </div>

          <div className="compose-card">
        <div className="compose-head">
          <Avatar
            initials={profile.initials ?? "?"}
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            size={48}
          />
          <div className="compose-meta">
            <div className="compose-name">{profile.name}</div>
            <div className="compose-audience">
              <GlobeIcon size={14} /> Anyone <CaretDown size={12} />
            </div>
          </div>
          <button className="settings-btn" type="button" onClick={onOpenSettings}>
            <GearIcon size={16} /> Edit profile
          </button>
        </div>

        <textarea
          ref={textRef}
          className="compose-input"
          value={draft.text}
          onChange={(e) => onChange({ text: e.target.value })}
          onKeyDown={onTextKeyDown}
          placeholder="What do you want to talk about?"
          autoFocus
          spellCheck
        />

        {/* Attachments */}
        {draft.imageDataUrl && (
          <div className="attach-thumb">
            <img src={draft.imageDataUrl} alt="attachment" />
            <button
              className="attach-remove"
              type="button"
              onClick={() => onChange({ imageDataUrl: undefined })}
              aria-label="Remove image"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
        {draft.link && (
          <div className="attach-link">
            <LinkCard link={draft.link} />
            <button
              className="attach-remove"
              type="button"
              onClick={() => onChange({ link: undefined })}
              aria-label="Remove link"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
        {showLink && (
          <div className="link-form">
            <input
              className="field-input"
              placeholder="https://example.com/article"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
            <input
              className="field-input"
              placeholder="Card title (optional)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
            />
            <div className="link-form-actions">
              <button className="text-btn" type="button" onClick={() => setShowLink(false)}>
                Cancel
              </button>
              <button className="post-btn" type="button" onClick={addLink} disabled={!linkUrl.trim()}>
                Add link
              </button>
            </div>
          </div>
        )}

        <div className="compose-hint">
          <span>
            Tip: type <code>@[Name]</code> for a blue @mention — e.g.{" "}
            <code>@[The Home Depot]</code>.
          </span>
          <label className="hint-toggle" title="Type @ to auto-insert @[ ] with your cursor inside">
            <input
              type="checkbox"
              checked={autoFormatMentions}
              onChange={onToggleAutoFormatMentions}
            />
            Auto-format mentions
          </label>
          {autoFormatMentions && (
            <span className="hint-note">Typing @ auto-inserts the brackets.</span>
          )}
        </div>

        <div className="compose-foot">
          <div className="compose-attach">
            <button className="attach-btn" type="button" onClick={() => fileRef.current?.click()}>
              <ImageIcon size={20} /> Photo
            </button>
            <button className="attach-btn" type="button" onClick={() => setShowLink((s) => !s)}>
              <LinkIcon size={20} /> Link
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <span className={over ? "char-count char-count--over" : "char-count"}>
              {count.toLocaleString()} / {MAX_POST_CHARS.toLocaleString()}
            </span>
          </div>
          <button className="post-btn post-btn--lg" type="button" onClick={onPreview} disabled={empty || over}>
            Preview in feed →
          </button>
        </div>
          </div>
        </div>

        {!narrowViewport && (
          <aside className="compose-preview">
            <div className="compose-preview-bar">
              <span className="compose-preview-label">Live preview</span>
              <div className="live-toggle" role="tablist" aria-label="Preview width">
                <button
                  type="button"
                  role="tab"
                  aria-selected={liveDevice === "mobile"}
                  className={liveDevice === "mobile" ? "live-toggle-btn is-active" : "live-toggle-btn"}
                  onClick={() => setLiveDevice("mobile")}
                >
                  Mobile
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={liveDevice === "desktop"}
                  className={liveDevice === "desktop" ? "live-toggle-btn is-active" : "live-toggle-btn"}
                  onClick={() => setLiveDevice("desktop")}
                >
                  Desktop
                </button>
              </div>
            </div>

            <div className="compose-preview-stage">
              <PostCard data={livePost} textWidth={liveWidth} />
            </div>

            <div className="compose-preview-fold">
              {fold.truncated
                ? `${fold.chars.toLocaleString()} characters show before “…more”`
                : "Fits in the hook — no “…more”"}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
