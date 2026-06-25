import {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Avatar } from "./Avatar";
import { LinkCard } from "./LinkCard";
import type { LinkPreview } from "../types";
import { computeHook, type HookResult } from "../measurer";
import { cardWidthFor } from "../constants";
import { parseMentions, segmentsFromLinks, type Segment } from "../segments";
import {
  ThumbUp,
  CommentIcon,
  RepostIcon,
  SendIcon,
  GlobeIcon,
  DotsIcon,
  CloseIcon,
  PlusIcon,
  ReactionBadge,
} from "./icons";

export interface PostCardData {
  name: string;
  headline: string;
  initials: string;
  avatarUrl?: string;
  avatarHue?: number;
  degree?: string;
  reason?: string;
  timeAgo: string;
  reactions: number;
  comments: number;
  reposts: number;
  text: string;
  links?: string[];
  imageUrl?: string;
  link?: LinkPreview;
  isMe?: boolean;
}

interface PostCardProps {
  data: PostCardData;
  textWidth: number;
}

// Render segments: bold-blue spans for mentions, raw strings for plain runs
// (matching the measurer, which uses text nodes for plain text).
function renderSegs(segs: Segment[]): ReactNode {
  return segs.map((s, i) =>
    s.mention ? (
      <span key={i} className="entity-link">
        {s.text}
      </span>
    ) : (
      s.text
    )
  );
}

const reasonInitials = (reason: string) =>
  reason
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function TopControls() {
  return (
    <div className="post-top-controls">
      <button className="icon-btn" type="button" tabIndex={-1} aria-label="More">
        <DotsIcon size={20} />
      </button>
      <button className="icon-btn" type="button" tabIndex={-1} aria-label="Dismiss">
        <CloseIcon size={18} />
      </button>
    </div>
  );
}

export const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  function PostCard({ data, textWidth }, ref) {
    const segments = useMemo<Segment[]>(
      () =>
        data.links ? segmentsFromLinks(data.text, data.links) : parseMentions(data.text),
      [data.text, data.links]
    );

    const [hook, setHook] = useState<HookResult>({
      visibleSegments: segments,
      truncated: false,
    });
    const [expanded, setExpanded] = useState(false);

    useLayoutEffect(() => {
      setHook(computeHook(segments, textWidth));
    }, [segments, textWidth]);

    useLayoutEffect(() => {
      setExpanded(false);
    }, [textWidth, segments]);

    const showMore = hook.truncated && !expanded;

    return (
      <article className="post-card" ref={ref} style={{ width: cardWidthFor(textWidth) }}>
        {data.reason && (
          <>
            <div className="post-reason">
              <Avatar initials={reasonInitials(data.reason)} hue={data.avatarHue} name={data.reason} size={24} />
              <span className="post-reason-text">{data.reason}</span>
              <span className="post-reason-spacer" />
              <TopControls />
            </div>
            <div className="post-divider" />
          </>
        )}

        <header className="post-header">
          <Avatar
            initials={data.initials}
            avatarUrl={data.avatarUrl}
            hue={data.avatarHue}
            name={data.name}
          />
          <div className="post-byline">
            <div className="post-author-row">
              <span className="post-author">{data.name}</span>
              {data.degree && <span className="post-degree"> · {data.degree}</span>}
            </div>
            <div className="post-headline">{data.headline}</div>
            <div className="post-meta">
              {data.timeAgo} · <GlobeIcon size={12} className="meta-globe" />
            </div>
          </div>
          {!data.isMe && (
            <button className="connect-btn" type="button" tabIndex={-1}>
              <PlusIcon size={16} className="connect-plus" />
              {data.degree === "3rd+" ? "Follow" : "Connect"}
            </button>
          )}
          {!data.reason && <TopControls />}
        </header>

        {/* The post text box: exact width, font + line-height from the spec.
            white-space: pre-wrap → a trailing newline before the cut is real,
            which is how "… more" lands on line 3 of its own. */}
        <div className="post-body" lang="en" style={{ width: textWidth }}>
          {expanded ? (
            renderSegs(segments)
          ) : (
            <>
              {renderSegs(hook.visibleSegments)}
              {showMore && (
                <>
                  <span className="more-ellipsis">… </span>
                  <button type="button" className="more-link" onClick={() => setExpanded(true)}>
                    more
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {data.imageUrl && (
          <div className="post-image-wrap">
            <img className="post-image" src={data.imageUrl} alt="" loading="lazy" />
          </div>
        )}

        {data.link && <LinkCard link={data.link} />}

        {/* New-style social bar: inline counts, reaction summary on the right. */}
        <div className="post-social">
          <button className="social-btn" type="button" tabIndex={-1}>
            <ThumbUp size={20} />
            {data.reactions > 0 && <span>{data.reactions.toLocaleString()}</span>}
          </button>
          <button className="social-btn" type="button" tabIndex={-1}>
            <CommentIcon size={20} />
            {data.comments > 0 && <span>{data.comments.toLocaleString()}</span>}
          </button>
          <button className="social-btn" type="button" tabIndex={-1}>
            <RepostIcon size={20} />
            {data.reposts > 0 && <span>{data.reposts.toLocaleString()}</span>}
          </button>
          <button className="social-btn" type="button" tabIndex={-1}>
            <SendIcon size={20} />
          </button>
          <span className="social-spacer" />
          {data.reactions > 0 && (
            <span className="reaction-cluster" title={`${data.reactions} reactions`}>
              <ReactionBadge kind="like" />
              <ReactionBadge kind="love" />
              <ReactionBadge kind="insight" />
            </span>
          )}
        </div>
      </article>
    );
  }
);
