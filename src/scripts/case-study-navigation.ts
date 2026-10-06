export function initializeCaseStudyNavigation() {
  const returnLink = document.querySelector<HTMLAnchorElement>('[data-case-home]');
  if (!returnLink) return;
  window.addEventListener('popstate', () => {
    // Reloading a pushed modal URL replaces its document with the standalone
    // case. Back can then change only the URL, leaving that case's DOM in place.
    // Load the homepage at the return collection instead of keeping a stale case.
    if (location.pathname === '/') location.replace(returnLink.href);
  });
}
