// One avatar component for everyone. The previewing author passes a Profile
// (renders avatarUrl if present, else an initials circle); filler authors pass
// initials + a hue directly. Same visual treatment so the previewed post is
// indistinguishable from filler.

interface AvatarProps {
  initials: string;
  avatarUrl?: string;
  hue?: number; // 0–360; defaults to a neutral LinkedIn-ish blue
  name: string;
  size?: number; // px; default 48 (feed post avatar)
}

export function Avatar({ initials, avatarUrl, hue = 210, name, size = 48 }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size / 2.7) };
  if (avatarUrl) {
    return (
      <img
        className="avatar"
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="avatar avatar--initials"
      style={{ ...style, background: `hsl(${hue} 45% 55%)` }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
