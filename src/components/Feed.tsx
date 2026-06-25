import { useCallback, useRef } from "react";
import { PostCard, type PostCardData } from "./PostCard";
import { ShareTrigger } from "./ShareTrigger";
import { FILLER_POSTS, MY_POST_INDEX } from "../data";
import type { Profile } from "../profile";
import { cardWidthFor, MAX_TEXT_WIDTH, MIN_TEXT_WIDTH } from "../constants";

interface FeedProps {
  textWidth: number;
  onDragWidth: (w: number) => void;
  myPost: PostCardData | null;
  myPostRef: React.Ref<HTMLDivElement>;
  profile: Profile;
  onEdit: () => void;
}

const fillerToData = (f: (typeof FILLER_POSTS)[number]): PostCardData => ({
  name: f.name,
  headline: f.headline,
  initials: f.initials,
  avatarUrl: f.avatarUrl,
  avatarHue: f.avatarHue,
  degree: f.degree,
  reason: f.reason,
  timeAgo: f.timeAgo,
  reactions: f.reactions,
  comments: f.comments,
  reposts: f.reposts,
  text: f.text,
  links: f.links,
  imageUrl: f.imageUrl,
  link: f.link,
});

// The center column: a "Start a post" trigger + the organic feed with my post
// spliced in, styled identically to filler. The drag handle on the right edge
// resizes the text container live.
export function Feed({
  textWidth,
  onDragWidth,
  myPost,
  myPostRef,
  profile,
  onEdit,
}: FeedProps) {
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const s = dragState.current;
      if (!s) return;
      const next = s.startWidth + (e.clientX - s.startX);
      onDragWidth(Math.max(MIN_TEXT_WIDTH, Math.min(MAX_TEXT_WIDTH, next)));
    },
    [onDragWidth]
  );

  const endDrag = useCallback(() => {
    dragState.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    document.body.classList.remove("dragging");
  }, [onPointerMove]);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: textWidth };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
      document.body.classList.add("dragging");
    },
    [textWidth, onPointerMove, endDrag]
  );

  const cardWidth = cardWidthFor(textWidth);
  const before = FILLER_POSTS.slice(0, MY_POST_INDEX);
  const after = FILLER_POSTS.slice(MY_POST_INDEX);

  return (
    <div className="center-col" style={{ width: cardWidth }}>
      <div className="feed">
        <ShareTrigger profile={profile} onEdit={onEdit} />

        {before.map((f) => (
          <PostCard key={f.id} data={fillerToData(f)} textWidth={textWidth} />
        ))}

        {myPost && (
          <PostCard
            key="my-post"
            ref={myPostRef}
            data={myPost}
            textWidth={textWidth}
           
          />
        )}

        {after.map((f) => (
          <PostCard key={f.id} data={fillerToData(f)} textWidth={textWidth} />
        ))}
      </div>

      <div
        className="drag-handle"
        onPointerDown={startDrag}
        role="separator"
        aria-orientation="vertical"
        aria-label="Drag to resize the feed width"
        title="Drag to resize"
      >
        <span className="drag-grip" />
      </div>
    </div>
  );
}
