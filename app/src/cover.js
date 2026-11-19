// Vice Cover poster renderer: a GTA key-art collage — one big hero panel on the left, five
// smaller panels on the right (a 2x2 grid plus one wide vignette along the bottom), white
// gutters, a sunset banner along the foot
// with a skyline silhouette, and a huge gradient title with a thick dark outline straddling
// the collage and the banner. Decorative badges (location pill, EST. starburst, NEW circle,
// HEAT stars and a diagonal ribbon) complete the poster look. Everything is drawn from
// scratch on canvas; no Rockstar logo, artwork or font is used anywhere.

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    filter: '',
    accent: '#ffd21f',
    glow: 'rgba(255,45,120,0.55)',
    titleStops: [[0, '#ffe14d'], [0.55, '#ff7a1a'], [1, '#ff2d78']],
    bannerStops: [[0, '#ff2d78'], [0.55, '#ff5e3a'], [1, '#ffb347']],
    skyline: '#1a0b2e',
  },
  neon: {
    label: 'Neon Nights',
    filter: '',
    accent: '#00f0ff',
    glow: 'rgba(255,45,212,0.55)',
    titleStops: [[0, '#fff06a'], [0.5, '#ff9a1f'], [1, '#ff2dd4']],
    bannerStops: [[0, '#2b0a4e'], [0.55, '#7a0f6e'], [1, '#ff2dd4']],
    skyline: '#0d0218',
  },
  noir: {
    label: 'Vice Noir',
    filter: 'grayscale(0.85) contrast(1.15) brightness(0.96)',
    accent: '#e8e8e8',
    glow: 'rgba(0,0,0,0.6)',
    titleStops: [[0, '#ffffff'], [0.55, '#d9d9d9'], [1, '#8f8f8f']],
    bannerStops: [[0, '#101018'], [1, '#2e2e3a']],
    skyline: '#05050a',
  },
};

/** Geometry of the poster for a canvas of w x h. */
export function posterLayout(w, h) {
  const frame = Math.max(3, Math.round(w * 0.006));
  const gap = Math.max(3, Math.round(w * 0.008));
  const ix = frame, iy = frame, iw = w - frame * 2, ih = h - frame * 2;
  const bannerH = Math.round(ih * 0.16);
  const collageH = ih - bannerH;
  const heroW = Math.round((iw - gap) * 0.58);
  const rightX = ix + heroW + gap;
  const rightW = iw - heroW - gap;
  // Right column: a 2x2 grid of vignettes on top, one wide vignette along the bottom.
  const wideH = Math.round(collageH * 0.30);
  const gridH = collageH - wideH - gap;
  const topH = Math.round((gridH - gap) / 2);
  const botH = gridH - topH - gap;
  const vigW = Math.round((rightW - gap) / 2);
  return {
    frame, gap,
    hero: { x: ix, y: iy, w: heroW, h: collageH },
    v1: { x: rightX, y: iy, w: vigW, h: topH },
    v2: { x: rightX + vigW + gap, y: iy, w: rightW - vigW - gap, h: topH },
    v3: { x: rightX, y: iy + topH + gap, w: vigW, h: botH },
    v4: { x: rightX + vigW + gap, y: iy + topH + gap, w: rightW - vigW - gap, h: botH },
    v5: { x: rightX, y: iy + gridH + gap, w: rightW, h: wideH },
    banner: { x: ix, y: iy + collageH, w: iw, h: bannerH },
    collageBottom: iy + collageH,
    inner: { x: ix, y: iy, w: iw, h: ih },
  };
}

/** Which panel (0 hero, 1-5 vignettes) contains canvas point (x, y), or -1. */
export function panelAt(L, x, y) {
  const rects = [L.hero, L.v1, L.v2, L.v3, L.v4, L.v5];
  for (let i = 0; i < 6; i++) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

/** Deterministic pseudo-random in [0,1) for a stable skyline. */
function rand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws one photo panel: cover-fit photo with zoom/pan, grade overlays, white inner border. */
function drawPhotoPanel(ctx, r, panel, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  if (panel.img) {
    const iw = panel.img.naturalWidth, ih = panel.img.naturalHeight;
    const base = Math.max(r.w / iw, r.h / ih) * panel.zoom;
    const pw = iw * base, ph = ih * base;
    const dx = panel.ox * Math.max(0, (pw - r.w) / 2);
    const dy = panel.oy * Math.max(0, (ph - r.h) / 2);
    if (grade.filter) ctx.filter = grade.filter;
    ctx.drawImage(panel.img, r.x + (r.w - pw) / 2 + dx, r.y + (r.h - ph) / 2 + dy, pw, ph);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#241534';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  // Warm sunset wash rising from the bottom of every panel.
  const wash = ctx.createLinearGradient(0, r.y + r.h * 0.45, 0, r.y + r.h);
  if (grade === GRADES.noir) {
    wash.addColorStop(0, 'rgba(0,0,0,0)');
    wash.addColorStop(1, 'rgba(0,0,0,0.45)');
  } else if (grade === GRADES.neon) {
    wash.addColorStop(0, 'rgba(0,240,255,0)');
    wash.addColorStop(0.6, 'rgba(255,45,212,0.10)');
    wash.addColorStop(1, 'rgba(120,10,90,0.34)');
  } else {
    wash.addColorStop(0, 'rgba(255,120,40,0)');
    wash.addColorStop(0.6, 'rgba(255,90,40,0.12)');
    wash.addColorStop(1, 'rgba(200,30,120,0.34)');
  }
  ctx.fillStyle = wash;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  // Soft purple shade from the top for depth.
  const top = ctx.createLinearGradient(0, r.y, 0, r.y + r.h * 0.3);
  top.addColorStop(0, 'rgba(40,10,70,0.20)');
  top.addColorStop(1, 'rgba(40,10,70,0)');
  ctx.fillStyle = top;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const lw = Math.max(2, Math.round(r.w * 0.004));
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = lw;
  ctx.strokeRect(r.x + lw / 2, r.y + lw / 2, r.w - lw, r.h - lw);
  ctx.restore();
}

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.6, x + s * 0.16, y - s);
  ctx.stroke();
  const tx = x + s * 0.16, ty = y - s;
  ctx.lineWidth = Math.max(1.5, s * 0.05);
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.95 + i * 0.28);
    const ex = tx + Math.cos(a) * s * 0.42;
    const ey = ty + Math.sin(a) * s * 0.30 + s * 0.10;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * s * 0.25, ty + Math.sin(a) * s * 0.12 - s * 0.08, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

/** Skyline silhouette along the bottom of the banner: dark buildings, lit windows, palms. */
function drawSkyline(ctx, b, grade, w) {
  const stripH = b.h * 0.20;
  const baseY = b.y + b.h;
  const topY = baseY - stripH;
  ctx.save();
  ctx.fillStyle = grade.skyline;
  const n = Math.max(8, Math.round(b.w / (w * 0.035)));
  const bw = b.w / n;
  for (let i = 0; i < n; i++) {
    const bh = stripH * (0.35 + rand(i) * 0.65);
    ctx.fillRect(b.x + i * bw + 1, baseY - bh, bw - 2, bh);
  }
  // A few lit windows.
  ctx.fillStyle = '#ffd21f';
  for (let i = 0; i < n * 2; i++) {
    if (rand(100 + i) < 0.45) continue;
    const wx = b.x + rand(200 + i) * b.w;
    const wy = baseY - stripH * (0.15 + rand(300 + i) * 0.7);
    ctx.fillRect(wx, wy, Math.max(2, w * 0.004), Math.max(2, w * 0.004));
  }
  drawPalm(ctx, b.x + b.w * 0.05, baseY, stripH * 1.5, grade.skyline);
  drawPalm(ctx, b.x + b.w * 0.95, baseY, stripH * 1.5, grade.skyline);
  ctx.restore();
}

function drawBanner(ctx, b, grade) {
  const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  for (const [stop, color] of grade.bannerStops) g.addColorStop(stop, color);
  ctx.fillStyle = g;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  // Sun glow at the top centre of the banner.
  const glow = ctx.createRadialGradient(b.x + b.w / 2, b.y, 0, b.x + b.w / 2, b.y, b.w * 0.45);
  glow.addColorStop(0, 'rgba(255,220,120,0.35)');
  glow.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  drawSkyline(ctx, b, grade, b.w + b.x * 2);
}

/** Fits a font size so `text` fits maxW, starting from startSize. */
function fitSize(ctx, text, maxW, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > 24) {
    size -= 4;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

const DISPLAY = '"Archivo Black", "Arial Black", sans-serif';

function drawTitleBlock(ctx, L, state, grade, w) {
  const cx = L.inner.x + L.inner.w / 2;
  const title = (state.title || '').trim().toUpperCase() || 'VICE SUNSET';
  const sub = (state.subtitle || '').trim().toUpperCase();
  const badge = (state.badge || '').trim().toUpperCase();

  // Title: huge, gradient fill, thick dark outline, glow — straddling collage and banner.
  const maxW = L.inner.w * 0.97;
  const size = fitSize(ctx, title, maxW, Math.round(L.inner.w * 0.145), DISPLAY);
  const baseline = L.collageBottom + L.banner.h * 0.34;
  const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.1);
  for (const [stop, color] of grade.titleStops) grad.addColorStop(stop, color);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px ${DISPLAY}`;
  ctx.lineJoin = 'round';
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.03;
  ctx.strokeStyle = '#160a1e';
  ctx.lineWidth = size * 0.10;
  ctx.strokeText(title, cx, baseline);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, baseline);
  ctx.restore();

  // Location pill just above the title.
  if (badge) {
    const pillSize = Math.max(14, Math.round(L.banner.h * 0.16));
    ctx.save();
    ctx.font = `${pillSize}px ${DISPLAY}`;
    const label = `★ ${badge} ★`;
    const tw = ctx.measureText(label).width;
    const pw = tw + pillSize * 1.6, ph = pillSize * 1.9;
    const px = cx - pw / 2, py = baseline - size * 0.78 - ph - Math.round(L.banner.h * 0.06);
    ctx.fillStyle = 'rgba(20,8,30,0.88)';
    roundRect(ctx, px, py, pw, ph, ph / 2);
    ctx.fill();
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(1.5, w * 0.0015);
    roundRect(ctx, px, py, pw, ph, ph / 2);
    ctx.stroke();
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, py + ph / 2 + pillSize * 0.04);
    ctx.restore();
  }

  // Subtitle: spaced capitals below the title, inside the banner, above the skyline.
  if (sub) {
    const subSize = Math.max(12, Math.round(L.banner.h * 0.17));
    ctx.save();
    ctx.font = `${subSize}px ${DISPLAY}`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`; } catch { /* older canvas */ }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = subSize * 0.25;
    ctx.fillStyle = grade.accent;
    ctx.fillText(sub, cx, L.collageBottom + L.banner.h * 0.64);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    ctx.restore();
  }
}

function drawStarburst(ctx, cx, cy, rOuter, rInner, points, fill, stroke) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(1.5, rOuter * 0.05);
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawBadges(ctx, L, state, grade, w) {
  // Diagonal ribbon across the hero's top-left corner.
  ctx.save();
  ctx.beginPath();
  ctx.rect(L.hero.x, L.hero.y, L.hero.w, L.hero.h);
  ctx.clip();
  ctx.translate(L.hero.x, L.hero.y);
  ctx.rotate(-Math.PI / 4);
  const bandH = Math.max(16, Math.round(w * 0.026));
  const bandY = Math.round(w * 0.10);
  ctx.fillStyle = '#ff2d78';
  ctx.fillRect(-w, bandY - bandH / 2, w * 2, bandH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(bandH * 0.52)}px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HOT PURSUIT', 0, bandY + bandH * 0.03);
  ctx.restore();

  // HEAT + stars pill, top-right of the hero.
  const heatSize = Math.max(12, Math.round(L.hero.h * 0.028));
  ctx.save();
  ctx.font = `${heatSize}px ${DISPLAY}`;
  const heatLabel = 'HEAT ★★★★☆';
  const hw = ctx.measureText(heatLabel).width + heatSize * 1.4;
  const hh = heatSize * 1.9;
  const hx = L.hero.x + L.hero.w - hw - Math.round(w * 0.012);
  const hy = L.hero.y + Math.round(w * 0.012);
  ctx.fillStyle = 'rgba(20,8,30,0.85)';
  roundRect(ctx, hx, hy, hw, hh, hh / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEAT ', hx + hw / 2 - ctx.measureText('★★★★☆').width / 2, hy + hh / 2 + heatSize * 0.04);
  ctx.fillStyle = '#ff2d78';
  ctx.fillText('★★★★', hx + hw / 2 + ctx.measureText('HEAT ').width / 2 - ctx.measureText('☆').width / 2, hy + hh / 2 + heatSize * 0.04);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('☆', hx + hw / 2 + ctx.measureText('HEAT ★★★★').width / 2, hy + hh / 2 + heatSize * 0.04);
  ctx.restore();

  // Yellow EST. starburst on the seam between hero and the right column.
  const sr = Math.max(22, Math.round(w * 0.042));
  const scx = L.v1.x - L.gap / 2;
  const scy = L.hero.y + L.hero.h * 0.52;
  ctx.save();
  ctx.translate(scx, scy);
  ctx.rotate(-0.21);
  drawStarburst(ctx, 0, 0, sr, sr * 0.82, 12, '#ffd21f', '#160a1e');
  ctx.fillStyle = '#160a1e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(sr * 0.30)}px ${DISPLAY}`;
  ctx.fillText('EST.', 0, -sr * 0.16);
  ctx.fillText('2026', 0, sr * 0.20);
  ctx.restore();

  // Pink NEW circle on the wide bottom vignette (v5).
  const nr = Math.max(16, Math.round(w * 0.026));
  const ncx = L.v5.x + L.v5.w - nr - Math.round(w * 0.008);
  const ncy = L.v5.y + nr + Math.round(w * 0.008);
  ctx.save();
  ctx.beginPath();
  ctx.arc(ncx, ncy, nr, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2d78';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, nr * 0.10);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(nr * 0.52)}px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEW', ncx, ncy + nr * 0.05);
  ctx.restore();
}

/**
 * Draws the whole poster onto the canvas at its own size.
 * state: { grade, title, subtitle, badge, panels: [{img, zoom, ox, oy} x6] }
 * opts: { selected } — a panel index to outline for the editor (never on export).
 */
export function drawPoster(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const L = posterLayout(w, h);
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  drawPhotoPanel(ctx, L.hero, state.panels[0], grade);
  drawPhotoPanel(ctx, L.v1, state.panels[1], grade);
  drawPhotoPanel(ctx, L.v2, state.panels[2], grade);
  drawPhotoPanel(ctx, L.v3, state.panels[3], grade);
  drawPhotoPanel(ctx, L.v4, state.panels[4], grade);
  drawPhotoPanel(ctx, L.v5, state.panels[5], grade);
  drawBanner(ctx, L.banner, grade);
  drawTitleBlock(ctx, L, state, grade, w);
  drawBadges(ctx, L, state, grade, w);
  // Thin gold frame around the whole cover.
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = L.frame;
  ctx.strokeRect(L.frame / 2, L.frame / 2, w - L.frame, h - L.frame);
  // Editor-only selection outline (never drawn on export).
  if (typeof opts.selected === 'number' && opts.selected >= 0) {
    const rects = [L.hero, L.v1, L.v2, L.v3, L.v4, L.v5];
    const r = rects[opts.selected];
    ctx.save();
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(3, Math.round(w * 0.005));
    ctx.setLineDash([Math.round(w * 0.012), Math.round(w * 0.008)]);
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.restore();
  }
  return L;
}
