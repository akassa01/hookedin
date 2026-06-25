// LinkedIn News + a promo card. Pure static chrome for feed realism.

const NEWS = [
  { title: "AI agents move from demos to production", meta: "2h ago · 4,201 readers" },
  { title: "Why bootstrapped SaaS is having a moment", meta: "5h ago · 1,883 readers" },
  { title: "The hiring market cools for new grads", meta: "8h ago · 12,043 readers" },
  { title: "NHL analytics teams are quietly hiring", meta: "1d ago · 942 readers" },
  { title: "Series B rounds are smaller and slower", meta: "1d ago · 3,517 readers" },
];

export function RightSidebar() {
  return (
    <aside className="li-right">
      <div className="li-card li-news-card">
        <div className="li-news-head">
          <span className="li-news-title">LinkedIn News</span>
          <span className="li-news-info" aria-hidden="true">ⓘ</span>
        </div>
        <ul className="li-news-list">
          {NEWS.map((n) => (
            <li key={n.title} className="li-news-item">
              <span className="li-news-dot" aria-hidden="true" />
              <div>
                <div className="li-news-headline">{n.title}</div>
                <div className="li-news-meta">{n.meta}</div>
              </div>
            </li>
          ))}
        </ul>
        <button className="li-news-more" type="button" tabIndex={-1}>
          Show more ⌄
        </button>
      </div>

      <div className="li-card li-promo-card">
        <div className="li-promo-label">Promoted</div>
        <div className="li-promo-body">
          <div className="li-promo-logo" />
          <div className="li-promo-text">
            Ship your hook before you ship your post — preview it in the feed.
          </div>
        </div>
      </div>

      <div className="li-footer">
        <span>About</span>
        <span>Accessibility</span>
        <span>Help</span>
        <span>Privacy</span>
        <span>Ads</span>
        <span className="li-footer-brand">hookedin · a feed mock</span>
      </div>
    </aside>
  );
}
