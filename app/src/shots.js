// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos loaded;
// ?shot=cover shows the cover alone. Query params: photo (hero sample), v1/v2/v3 (vignette
// samples), caption (title), sub (subtitle), badge (location pill), grade, size.
// window.__shotReady is set once the scene is painted with the display font loaded.
export async function runShot(shot, query, setup) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const scene = {
    hero: query.get('photo') ?? 'pier',
    v1: query.get('v1') ?? 'boulevard',
    v2: query.get('v2') ?? 'pier',
    v3: query.get('v3') ?? 'boulevard',
    title: query.get('caption') ?? 'VICE SUNSET',
    subtitle: query.get('sub') ?? 'CHASE THE LAST LIGHT',
    badge: query.get('badge') ?? 'PALM BAY',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
  };
  await setup(scene);
  try { await document.fonts.ready; } catch { /* font already usable */ }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
