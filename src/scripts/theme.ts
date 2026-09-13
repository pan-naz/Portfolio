export {};
const root = document.documentElement;
const preference = matchMedia('(prefers-color-scheme: dark)');
let explicit = false;
try { explicit = ['light','dark'].includes(localStorage.getItem('naz-theme') ?? ''); } catch {}
function syncTheme(dark: boolean) {
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171716' : '#FAF8F7');
  document.querySelectorAll('.theme-toggle').forEach(button => button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`));
  window.dispatchEvent(new Event('themechange'));
}
document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
  explicit = true;
  const dark = root.dataset.theme !== 'dark';
  try { localStorage.setItem('naz-theme', dark ? 'dark' : 'light'); } catch {}
  syncTheme(dark);
}));
preference.addEventListener('change', event => { if (!explicit) syncTheme(event.matches); });
syncTheme(root.dataset.theme === 'dark');
