import { Avatar } from "./Avatar";
import type { Profile } from "../profile";

// The logged-in user's mini profile card — this is YOU (the previewing author),
// so it reads from the swappable PROFILE, consistent with the rest of the app.
export function LeftSidebar({ profile }: { profile: Profile }) {
  return (
    <aside className="li-left">
      <div className="li-card li-profile-card">
        <div className="li-profile-banner" />
        <div className="li-profile-avatar">
          <Avatar
            initials={profile.initials ?? "?"}
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            size={56}
          />
        </div>
        <div className="li-profile-body">
          <div className="li-profile-name">{profile.name}</div>
          <div className="li-profile-headline">{profile.headline}</div>
        </div>
        <div className="li-profile-stats">
          <div className="li-stat-row">
            <span className="li-stat-label">Profile viewers</span>
            <span className="li-stat-num">1,284</span>
          </div>
          <div className="li-stat-row">
            <span className="li-stat-label">Post impressions</span>
            <span className="li-stat-num">9,317</span>
          </div>
        </div>
        <div className="li-profile-premium">
          <span className="li-premium-label">Saved items</span>
        </div>
      </div>

      <div className="li-card li-nav-card">
        {["Groups", "Events", "Newsletters"].map((x) => (
          <div key={x} className="li-nav-card-row">
            {x}
          </div>
        ))}
      </div>
    </aside>
  );
}
