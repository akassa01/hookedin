import { Avatar } from "./Avatar";
import type { Profile } from "../profile";
import { PencilIcon } from "./icons";

// The feed's "Start a post" bar. It doesn't edit inline — clicking it routes
// back to the compose screen, like LinkedIn's share box opening the composer.
export function ShareTrigger({
  profile,
  onEdit,
}: {
  profile: Profile;
  onEdit: () => void;
}) {
  return (
    <div className="li-card share-trigger">
      <Avatar
        initials={profile.initials ?? "?"}
        avatarUrl={profile.avatarUrl}
        name={profile.name}
        size={48}
      />
      <button className="share-trigger-input" type="button" onClick={onEdit}>
        Start a post
      </button>
      <button className="share-trigger-edit" type="button" onClick={onEdit}>
        <PencilIcon size={16} /> Edit post
      </button>
    </div>
  );
}
