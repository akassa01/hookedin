import { useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { LinkCard } from "./LinkCard";
import type { Profile } from "../profile";
import type { PostDraft } from "../types";
import { MAX_POST_CHARS } from "../constants";
import { readImageFile } from "../util";
import { CaretDown, GlobeIcon, ImageIcon, LinkIcon, GearIcon, CloseIcon } from "./icons";

interface ComposeScreenProps {
  profile: Profile;
  draft: PostDraft;
  onChange: (patch: Partial<PostDraft>) => void;
  onPreview: () => void;
  hasPosted: boolean;
  onBackToFeed: () => void;
  onOpenSettings: () => void;
}

// The focused "simple screen": write/paste the draft, attach an image and/or a
// link preview, then jump to the feed preview.
export function ComposeScreen({
  profile,
  draft,
  onChange,
  onPreview,
  hasPosted,
  onBackToFeed,
  onOpenSettings,
}: ComposeScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const count = draft.text.length;
  const over = count > MAX_POST_CHARS;
  const empty = draft.text.trim().length === 0 && !draft.imageDataUrl && !draft.link;

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
      <div className="compose-brandbar">
        <div className="tool-brand">
          hooked<span className="tool-brand-in">in</span>
        </div>
        {hasPosted && (
          <button className="ghost-btn" type="button" onClick={onBackToFeed}>
            ← Back to feed
          </button>
        )}
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
          className="compose-input"
          value={draft.text}
          onChange={(e) => onChange({ text: e.target.value })}
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
          Tip: type <code>@[Name]</code> for a blue @mention — e.g. <code>@[The Home Depot]</code>.
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
  );
}
