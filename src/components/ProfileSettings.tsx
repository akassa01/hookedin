import { useRef } from "react";
import type { Profile } from "../profile";
import { Avatar } from "./Avatar";
import { readImageFile, initialsFromName } from "../util";
import { CloseIcon } from "./icons";

interface ProfileSettingsProps {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
  onClose: () => void;
}

// The profile editor: name, headline/tag, photo. Changes apply live and are
// persisted by App. This populates the SAME swappable Profile shape the app was
// architected around — no other component changes.
export function ProfileSettings({ profile, onChange, onClose }: ProfileSettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange({ avatarUrl: await readImageFile(file) });
    e.target.value = "";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Edit profile</h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="settings-photo">
          <Avatar
            initials={profile.initials ?? "?"}
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            size={72}
          />
          <div className="settings-photo-actions">
            <button className="ghost-btn" type="button" onClick={() => fileRef.current?.click()}>
              {profile.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {profile.avatarUrl && (
              <button
                className="text-btn"
                type="button"
                onClick={() => onChange({ avatarUrl: undefined })}
              >
                Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
        </div>

        <label className="field">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            value={profile.name}
            onChange={(e) =>
              onChange({ name: e.target.value, initials: initialsFromName(e.target.value) })
            }
          />
        </label>

        <label className="field">
          <span className="field-label">Headline / tag</span>
          <input
            className="field-input"
            value={profile.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
          />
        </label>

        <div className="modal-foot">
          <button className="post-btn" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
