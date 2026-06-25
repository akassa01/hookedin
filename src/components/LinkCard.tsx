import type { LinkPreview } from "../types";
import { domainOf } from "../util";

// LinkedIn's link-unfurl card (thumbnail + title + domain), rendered below the
// post text. Bleeds to the card edges like a post image.
export function LinkCard({ link }: { link: LinkPreview }) {
  const domain = domainOf(link.url);
  return (
    <a
      className="link-card"
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.preventDefault()}
    >
      <div className="link-card-thumb">
        {link.imageDataUrl ? (
          <img src={link.imageDataUrl} alt="" />
        ) : (
          <span className="link-card-thumb-ph">{domain[0]?.toUpperCase() ?? "↗"}</span>
        )}
      </div>
      <div className="link-card-body">
        <div className="link-card-title">{link.title || domain}</div>
        <div className="link-card-domain">{domain}</div>
      </div>
    </a>
  );
}
