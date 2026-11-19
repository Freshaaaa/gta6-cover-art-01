// Wires the page: pick photos for the five panels, drag to pan, zoom each panel, write the
// title, subtitle and location badge, pick a colour grade and an export size, and export the
// poster as a PNG. A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawPoster, posterLayout, panelAt, GRADES } from './cover.js';
import { runShot } from './shots.js';

const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const badgeInput = document.getElementById('badge');

const PANEL_KEYS = ['hero', 'v1', 'v2', 'v3', 'v4'];
// Five distinct sample photos, one per panel: hero = woman by the convertible (boulevard),
// top-left = orange sports car, top-right = neon street, bottom-left = beach sunset,
// bottom-right = man fishing on the pier.
const DEFAULT_CROPS = [
  { sample: 'boulevard', zoom: 1.15, ox: 0, oy: 0 },
  { sample: 'sportscar', zoom: 1.15, ox: 0, oy: 0 },
  { sample: 'neonstreet', zoom: 1.15, ox: 0, oy: 0 },
  { sample: 'beach', zoom: 1.15, ox: 0, oy: 0 },
  { sample: 'pier', zoom: 1.15, ox: 0, oy: 0 },
];

const state = {
  size: '1080x1080',
  grade: 'sunset',
  title: titleInput.value,
  subtitle: subtitleInput.value,
  badge: badgeInput.value,
  selected: 0,
  panels: DEFAULT_CROPS.map((c) => ({ img: null, zoom: c.zoom, ox: c.ox, oy: c.oy })),
};

let layout = posterLayout(canvas.width, canvas.height);

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function render() {
  layout = drawPoster(canvas, state, { selected: state.selected });
}

function syncZoomSliders() {
  for (let i = 0; i < 5; i++) {
    document.getElementById(`zoom-${PANEL_KEYS[i]}`).value = String(state.panels[i].zoom);
  }
}

function setSize(size) {
  state.size = size;
  const [w, h] = SIZES[size];
  canvas.width = w;
  canvas.height = h;
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b.dataset.size === size));
  render();
}

function setGrade(grade) {
  state.grade = grade;
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('on', b.dataset.grade === grade));
  render();
}

async function loadDefaults() {
  for (let i = 0; i < 5; i++) {
    state.panels[i].img = await loadImage(`samples/${DEFAULT_CROPS[i].sample}.jpg`);
  }
  render();
}

// Photo inputs: one per panel.
PANEL_KEYS.forEach((key, i) => {
  document.getElementById(`photo-${key}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.panels[i].img = await loadImage(URL.createObjectURL(file));
    state.panels[i].zoom = 1;
    state.panels[i].ox = 0;
    state.panels[i].oy = 0;
    state.selected = i;
    syncZoomSliders();
    render();
  });
  document.getElementById(`zoom-${key}`).addEventListener('input', (e) => {
    state.panels[i].zoom = Number(e.target.value);
    state.selected = i;
    render();
  });
});

document.getElementById('fill-all').addEventListener('click', () => {
  const hero = state.panels[0].img;
  if (!hero) return;
  for (let i = 1; i < 5; i++) {
    state.panels[i].img = hero;
    state.panels[i].zoom = 1;
    state.panels[i].ox = 0;
    state.panels[i].oy = 0;
  }
  syncZoomSliders();
  render();
});

document.getElementById('reset-samples').addEventListener('click', async () => {
  for (let i = 0; i < 5; i++) {
    state.panels[i].img = await loadImage(`samples/${DEFAULT_CROPS[i].sample}.jpg`);
    state.panels[i].zoom = DEFAULT_CROPS[i].zoom;
    state.panels[i].ox = DEFAULT_CROPS[i].ox;
    state.panels[i].oy = DEFAULT_CROPS[i].oy;
  }
  syncZoomSliders();
  render();
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; render(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; render(); });
badgeInput.addEventListener('input', () => { state.badge = badgeInput.value; render(); });

document.querySelectorAll('#grades button').forEach((b) => {
  b.addEventListener('click', () => setGrade(b.dataset.grade));
});
document.querySelectorAll('#sizes button').forEach((b) => {
  b.addEventListener('click', () => setSize(b.dataset.size));
});

document.getElementById('export').addEventListener('click', () => {
  // Clean redraw without the editor selection outline, then download.
  drawPoster(canvas, state);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${state.size}.png`;
    a.click();
    status.textContent = `Saved cover-${state.size}.png`;
    render();
  }, 'image/png');
});

// Drag on the canvas pans the photo inside the panel under the pointer; a plain click
// (no drag) just selects that panel.
let drag = null;
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const i = panelAt(layout, p.x, p.y);
  if (i < 0) return;
  state.selected = i;
  render();
  const panel = state.panels[i];
  const r = [layout.hero, layout.v1, layout.v2, layout.v3, layout.v4][i];
  const iw = panel.img ? panel.img.naturalWidth : 1;
  const ih = panel.img ? panel.img.naturalHeight : 1;
  const base = Math.max(r.w / iw, r.h / ih) * panel.zoom;
  drag = { i, startX: p.x, startY: p.y, ox: panel.ox, oy: panel.oy, moved: false,
    overX: Math.max(0, iw * base - r.w), overY: Math.max(0, ih * base - r.h) };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = canvasPoint(e);
  const dx = p.x - drag.startX, dy = p.y - drag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  const panel = state.panels[drag.i];
  if (drag.overX > 0) panel.ox = Math.max(-1, Math.min(1, drag.ox + (dx * 2) / drag.overX));
  if (drag.overY > 0) panel.oy = Math.max(-1, Math.min(1, drag.oy + (dy * 2) / drag.overY));
  render();
});
canvas.addEventListener('pointerup', () => { drag = null; });

// Redraw once the display font arrives so the title uses Archivo Black.
if (document.fonts) {
  document.fonts.load('16px "Archivo Black"').then(render).catch(() => {});
  document.fonts.ready.then(render).catch(() => {});
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (scene) => {
    const names = [scene.hero, scene.v1, scene.v2, scene.v3, scene.v4];
    for (let i = 0; i < 5; i++) {
      state.panels[i].img = await loadImage(`samples/${names[i]}.jpg`);
      state.panels[i].zoom = scene.zoom ?? DEFAULT_CROPS[i].zoom;
      state.panels[i].ox = scene.ox?.[i] ?? DEFAULT_CROPS[i].ox;
      state.panels[i].oy = scene.oy?.[i] ?? DEFAULT_CROPS[i].oy;
    }
    state.title = scene.title;
    state.subtitle = scene.subtitle;
    state.badge = scene.badge;
    titleInput.value = scene.title;
    subtitleInput.value = scene.subtitle;
    badgeInput.value = scene.badge;
    setGrade(scene.grade);
    setSize(scene.size);
    state.selected = -1;
    render();
  });
} else {
  loadDefaults();
}
