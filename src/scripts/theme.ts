export {};
const root = document.documentElement;
function syncTheme(dark: boolean) {
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--color-bg-canvas').trim());
  document.querySelectorAll('.theme-toggle').forEach(button => button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`));
  document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === (dark ? 'dark' : 'light'))));
  window.dispatchEvent(new Event('themechange'));
}
document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  try { localStorage.setItem('naz-theme', dark ? 'dark' : 'light'); } catch {}
  syncTheme(dark);
}));
syncTheme(root.dataset.theme === 'dark');
document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
  const dark = button.dataset.themeChoice === 'dark';
  try { localStorage.setItem('naz-theme', dark ? 'dark' : 'light'); } catch {}
  syncTheme(dark);
}));

// Keep the DS's real-site preview and other open pages on the same saved theme.
window.addEventListener('storage', event => {
  if (event.key !== 'naz-theme' && event.key !== null) return;
  const saved = event.key === null ? null : event.newValue;
  syncTheme(saved === 'dark');
});
