// LinkedIn-style line icons. Single-path SVGs that take `currentColor`, so the
// action bar / nav can tint them like the real thing.

type IconProps = { size?: number; className?: string };

const svg = (path: string) =>
  function Icon({ size = 24, className }: IconProps) {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d={path} />
      </svg>
    );
  };

// ── Action bar ──────────────────────────────────────────────────────────────
export const ThumbUp = svg(
  "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
);
export const CommentIcon = svg(
  "M7 9h10v1H7V9zm0 4h7v-1H7v1zm16-2c0 6.075-4.925 11-11 11a10.93 10.93 0 0 1-4.66-1.03L2 22l1.03-5.34A10.93 10.93 0 0 1 2 12C2 5.925 6.925 1 13 1S23 5.925 23 11zm-2 0c0-4.962-4.038-9-9-9s-9 4.038-9 9c0 1.5.37 2.96 1.07 4.26l.22.4-.59 3.07 3.07-.59.4.22A8.94 8.94 0 0 0 12 20c4.962 0 9-4.038 9-9z"
);
export const RepostIcon = svg(
  "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
);
export const SendIcon = svg(
  "M3 3l18 9-18 9 4-9-4-9zm3.6 6L5 6.2 13.8 12 5 17.8 6.6 15 12 12 6.6 9z"
);

// ── Nav ─────────────────────────────────────────────────────────────────────
export const HomeIcon = svg("M3 11l9-8 9 8h-2v9h-5v-6H10v6H5v-9H3z");
export const NetworkIcon = svg(
  "M12 12.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5zM5 20v-1.5C5 16 8.1 14.5 12 14.5S19 16 19 18.5V20H5z"
);
export const JobsIcon = svg(
  "M9 4h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h6V6H9v1z"
);
export const MessagingIcon = svg(
  "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V5z"
);
export const BellIcon = svg(
  "M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-5l-2-2v-5a5 5 0 0 0-4-4.9V4a1 1 0 1 0-2 0v1.1A5 5 0 0 0 7 10v5l-2 2v1h14v-1z"
);
export const SearchIcon = svg(
  "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
);
export const GlobeIcon = svg(
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.5a14 14 0 0 0-1-3 8 8 0 0 1 3.5 3zM12 4a12 12 0 0 1 1.5 4h-3A12 12 0 0 1 12 4zM4.3 14a8 8 0 0 1 0-4h2.9a16 16 0 0 0 0 4H4.3zm.8 2h2.5a14 14 0 0 0 1 3 8 8 0 0 1-3.5-3zm2.5-8H5.1a8 8 0 0 1 3.5-3 14 14 0 0 0-1 3zM12 20a12 12 0 0 1-1.5-4h3A12 12 0 0 1 12 20zm0-6H9.2a14 14 0 0 1 0-4h5.6a14 14 0 0 1 0 4H12zm3.6 5a14 14 0 0 0 1-3h2.5a8 8 0 0 1-3.5 3zm1.4-5a16 16 0 0 0 0-4h2.9a8 8 0 0 1 0 4h-2.9z"
);
export const PlusIcon = svg("M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
export const VideoIcon = svg("M8 5v14l11-7z");
export const ImageIcon = svg(
  "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5zM8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
);
export const LinkIcon = svg(
  "M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12zM8 13h8v-2H8v2zm9-6h-4v1.9h4a3.1 3.1 0 0 1 0 6.2h-4V17h4a5 5 0 0 0 0-10z"
);
export const GearIcon = svg(
  "M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14 3h-4l-.3 2.9a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L3.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1L10 21h4l.3-2.9a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.7zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
);
export const PencilIcon = svg(
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.58z"
);
export const DotsIcon = svg(
  "M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
);
export const CloseIcon = svg(
  "M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"
);
export const CaretDown = svg("M7 10l5 5 5-5z");
export const LockIcon = svg(
  "M12 1a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0v3z"
);

// ── Reaction badges (the small overlapping colored circles) ─────────────────
export function ReactionBadge({
  kind,
}: {
  kind: "like" | "love" | "insight" | "celebrate";
}) {
  const map = {
    like: { bg: "#378fe9", glyph: "👍" },
    love: { bg: "#df704d", glyph: "❤️" },
    insight: { bg: "#f5bb5c", glyph: "💡" },
    celebrate: { bg: "#6dae4f", glyph: "👏" },
  } as const;
  const { bg, glyph } = map[kind];
  return (
    <span className="reaction-badge" style={{ background: bg }} aria-hidden="true">
      {glyph}
    </span>
  );
}
