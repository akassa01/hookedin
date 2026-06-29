import type { LinkPreview } from "../types";
import { domainOf } from "../util";

// LinkedIn's link-unfurl card, rendered below the post text and bleeding to the
// card edges. Two layouts, matching LinkedIn's feed:
//   • rich   — an OG image present: large hero image + title/domain caption bar.
//   • compact — no image: small left thumbnail (initial) + title/domain row.
export function LinkCard({ link }: { link: LinkPreview }) {
  const domain = link.domain || domainOf(link.url);
  const title = link.title || domain;

  if (link.imageDataUrl) {
    return (
      <a
        className="link-card link-card--rich"
        href={link.url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.preventDefault()}
      >
        <div className="link-card-hero">
          <img src={link.imageDataUrl} alt="" />
        </div>
        <div className="link-card-caption">
          <div className="link-card-title">{title}</div>
          <div className="link-card-domain">{domain}</div>
        </div>
      </a>
    );
  }

  return (
    <a
      className="link-card"
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.preventDefault()}
    >
      <div className="link-card-thumb">
        <span className="link-card-thumb-ph">{domain[0]?.toUpperCase() ?? "↗"}</span>
      </div>
      <div className="link-card-body">
        <div className="link-card-title">{title}</div>
        <div className="link-card-domain">{domain}</div>
      </div>
    </a>
  );
}
