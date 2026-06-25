import {
  HomeIcon,
  VideoIcon,
  NetworkIcon,
  BellIcon,
  JobsIcon,
} from "./icons";

// Mobile LinkedIn's BOTTOM tab bar: Home · Video · My Network · Notifications · Jobs.
const TABS = [
  { label: "Home", Icon: HomeIcon, active: true },
  { label: "Video", Icon: VideoIcon },
  { label: "My Network", Icon: NetworkIcon },
  { label: "Notifications", Icon: BellIcon },
  { label: "Jobs", Icon: JobsIcon },
];

export function MobileTabBar() {
  return (
    <nav className="m-tabbar">
      {TABS.map(({ label, Icon, active }) => (
        <button
          key={label}
          className={active ? "m-tab m-tab--active" : "m-tab"}
          type="button"
          tabIndex={-1}
        >
          <Icon size={24} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
