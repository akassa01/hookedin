import { Avatar } from "./Avatar";
import type { Profile } from "../profile";
import {
  SearchIcon,
  HomeIcon,
  NetworkIcon,
  JobsIcon,
  MessagingIcon,
  BellIcon,
  CaretDown,
} from "./icons";

// The LinkedIn global top nav. Static chrome — present purely so the feed reads
// as the real thing.
export function LinkedInNav({ profile }: { profile: Profile }) {
  const items = [
    { label: "Home", Icon: HomeIcon, active: true },
    { label: "My Network", Icon: NetworkIcon },
    { label: "Jobs", Icon: JobsIcon },
    { label: "Messaging", Icon: MessagingIcon },
    { label: "Notifications", Icon: BellIcon },
  ];
  return (
    <nav className="li-nav">
      <div className="li-nav-inner">
        <div className="li-nav-left">
          <div className="li-logo" aria-label="LinkedIn">in</div>
          <div className="li-search">
            <SearchIcon size={18} className="li-search-icon" />
            <input className="li-search-input" placeholder="Search" readOnly />
          </div>
        </div>
        <div className="li-nav-right">
          {items.map(({ label, Icon, active }) => (
            <button
              key={label}
              className={active ? "li-nav-item li-nav-item--active" : "li-nav-item"}
              type="button"
              tabIndex={-1}
            >
              <Icon size={24} className="li-nav-icon" />
              <span className="li-nav-label">{label}</span>
            </button>
          ))}
          <div className="li-nav-divider" />
          <button className="li-nav-item li-nav-me" type="button" tabIndex={-1}>
            <Avatar
              initials={profile.initials ?? "?"}
              avatarUrl={profile.avatarUrl}
              name={profile.name}
              size={24}
            />
            <span className="li-nav-label li-nav-me-label">
              Me <CaretDown size={12} />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
