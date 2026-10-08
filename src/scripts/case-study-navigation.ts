/** A modal owns its return viewport; native hash restoration must not move it mid-flight. */
export function suspendCaseStudyScrollRestoration(target: Pick<History, 'scrollRestoration'> = history) {
  const previous = target.scrollRestoration;
  target.scrollRestoration = 'manual';
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    target.scrollRestoration = previous;
  };
}

export function initializeCaseStudyNavigation() {
  const returnLink = document.querySelector<HTMLAnchorElement>('[data-case-home]');
  if (!returnLink) return;
  // A modal reload preserves the original homepage viewport in its history
  // entry, separately from the case's own reading position.
  const saved = history.state?.portfolioCaseOrigin;
  let origin: { url: string; top: number } | undefined;
  try {
    const url = new URL(saved?.url, location.href);
    if (history.state?.caseStudy && location.pathname === `/case-studies/${history.state.caseStudy}/`
      && url.origin === location.origin && url.pathname === '/'
      && Number.isFinite(saved?.top) && saved.top >= 0) {
      origin = { url: `${url.pathname}${url.search}${url.hash}`, top: saved.top };
      returnLink.href = origin.url;
    }
  } catch {}
  const prepareReturn = (reload = false) => {
    if (!origin) return;
    // One same-tab navigation consumes this handoff. An ordinary homepage
    // refresh must still restart its intro rather than reuse this position.
    try { sessionStorage.setItem('portfolio-case-return', JSON.stringify({ ...origin, ...(reload ? { reload: true } : {}) })); } catch {}
  };
  returnLink.addEventListener('click', event => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) prepareReturn();
  });
  window.addEventListener('popstate', () => {
    // Reloading a pushed modal URL replaces its document with the standalone
    // case. Back can then change only the URL, leaving that case's DOM in place.
    // Load the homepage at the return collection instead of keeping a stale case.
    if (location.pathname === '/') {
      prepareReturn(true);
      // The URL may already equal the return hash. location.replace would then
      // be another same-document navigation instead of loading the homepage.
      history.replaceState(history.state, '', returnLink.href);
      location.reload();
    }
  });
}
