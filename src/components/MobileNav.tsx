import { Avatar } from "./Avatar";
import type { Profile } from "../profile";
import { SearchIcon, PencilIcon, MessagingIcon } from "./icons";

// Mobile LinkedIn's TOP bar: profile pic · search · write · messages.
// (The bottom tab bar lives in MobileTabBar.)
export function MobileNav({
  profile,
  onEdit,
}: {
  profile: Profile;
  onEdit: () => void;
}) {
  return (
    <nav className="m-nav">
      <Avatar
        initials={profile.initials ?? "?"}
        avatarUrl={profile.avatarUrl}
        name={profile.name}
        size={32}
      />
      <div className="m-search">
        <SearchIcon size={18} className="m-search-icon" />
        <span className="m-search-text">I'm looking for…</span>
      </div>
      <button className="m-nav-icon-btn" type="button" onClick={onEdit} aria-label="Write a post">
        <PencilIcon size={22} />
      </button>
      <button className="m-nav-icon-btn" type="button" tabIndex={-1} aria-label="Messaging">
        <MessagingIcon size={22} />
      </button>
    </nav>
  );
}
