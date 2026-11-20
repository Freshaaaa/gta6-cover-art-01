// Vice Cover poster renderer v2: a GTA key-art collage — a review-quote strip across the
// top, one big pop-out hero panel on the left with a slanted edge, six vignettes on the right
// in a staggered collage (uneven row heights, alternating splits, slanted shared edges —
// never a uniform grid), and a sunset banner along the foot with a skyline silhouette. The
// title is huge and gradient with a thick dark outline, straddling the collage and the
// banner; under it a script subtitle, a spaced-caps tagline, then a billing block (COMING
// SOON, production credit + STARRING cast, barcode). Every panel carries a cast-style role
// tag (THE CLOSER, THE BOSS, ...), a gold ORIGINAL COVER ART seal sits on the collage's
// bottom-right corner, and the usual badges (location pill, EST. starburst, NEW circle,
// HEAT stars, diagonal ribbon) complete the poster look. Everything is drawn from scratch
// on canvas; no Rockstar logo, artwork or font is used anywhere.

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    // Mild warm cast so bright-day and dark-night photos share one sunset mood.
    filter: 'sepia(0.20) saturate(1.15)',
    accent: '#ffd21f',
    glow: 'rgba(255,45,120,0.55)',
    titleStops: [[0, '#ffe14d'], [0.18, '#fff6b0'], [0.5, '#ff7a1a'], [0.8, '#ff2d78'], [1, '#c026d3']],
    bannerStops: [[0, '#ff2d78'], [0.55, '#ff5e3a'], [1, '#ffb347']],
    skyline: '#1a0b2e',
  },
  neon: {
    label: 'Neon Nights',
    filter: '',
    accent: '#00f0ff',
    glow: 'rgba(255,45,212,0.55)',
    titleStops: [[0, '#fff06a'], [0.45, '#ff9a1f'], [0.8, '#ff2dd4'], [1, '#8b5cf6']],
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

export const DEFAULT_ROLES = ['THE CLOSER', 'THE ENFORCER', 'THE BOSS', 'THE LOOKOUT', 'THE FIXER', 'THE WHEELMAN', 'THE RIDER'];
export const DEFAULT_SCRIPT_SUB = 'one last score';
export const DEFAULT_QUOTE = 'A SUNSET YOU CAN OUTRUN';
export const DEFAULT_GAZETTE = 'THE BAY HERALD';

/** Geometry of the poster for a canvas of w x h. */
export function posterLayout(w, h) {
  const frame = Math.max(3, Math.round(w * 0.006));
  const gap = Math.max(3, Math.round(w * 0.008));
  const ix = frame, iy = frame, iw = w - frame * 2, ih = h - frame * 2;
  const quoteH = Math.round(ih * 0.052);
  const bannerH = Math.round(ih * 0.26);
  const collageTop = iy + quoteH;
  const collageH = ih - quoteH - bannerH;
  const slant = Math.max(6, Math.round(w * 0.022));
  const heroW = Math.round((iw - gap) * 0.56);
  const rightX = ix + heroW + gap;
  const rightW = iw - heroW - gap;
  // Right column: three staggered rows — uneven heights and alternating splits, so the
  // collage never reads as a uniform grid.
  const rowH1 = Math.round(collageH * 0.34);
  const rowH2 = Math.round(collageH * 0.30);
  const rowH3 = collageH - rowH1 - rowH2 - gap * 2;
  const r1 = collageTop, r2 = collageTop + rowH1 + gap, r3 = collageTop + rowH1 + rowH2 + gap * 2;
  const split1 = Math.round(rightW * 0.50);
  const split2 = Math.round(rightW * 0.44);
  const split3 = Math.round(rightW * 0.57);
  return {
    frame, gap, slant, quoteH, bannerH,
    quote: { x: ix, y: iy, w: iw, h: quoteH },
    hero: { x: ix, y: collageTop, w: heroW, h: collageH },
    v1: { x: rightX, y: r1, w: split1, h: rowH1 },
    v2: { x: rightX + split1 + gap, y: r1, w: rightW - split1 - gap, h: rowH1 },
    v3: { x: rightX, y: r2, w: split2, h: rowH2 },
    v4: { x: rightX + split2 + gap, y: r2, w: rightW - split2 - gap, h: rowH2 },
    v5: { x: rightX, y: r3, w: split3, h: rowH3 },
    v6: { x: rightX + split3 + gap, y: r3, w: rightW - split3 - gap, h: rowH3 },
    banner: { x: ix, y: collageTop + collageH, w: iw, h: bannerH },
    collageTop, collageBottom: collageTop + collageH,
    inner: { x: ix, y: iy, w: iw, h: ih },
  };
}

/** Which panel (0 hero, 1-6 vignettes) contains canvas point (x, y), or -1. */
export function panelAt(L, x, y) {
  const rects = [L.hero, L.v1, L.v2, L.v3, L.v4, L.v5, L.v6];
  for (let i = 0; i < 7; i++) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

/**
 * Slanted clip polygon for a panel, as [[x, y], ...] clockwise from the top-left.
 * The hero's top-right corner reaches one gap past its rect so it pops out over the
 * vignette column; vignette rows lean in alternating directions. The polygon always
 * stays inside its rect except for the hero's top overhang.
 */
export function panelPoly(L, key) {
  const s = L.slant, g = L.gap;
  if (key === 'hero') {
    const r = L.hero;
    return [
      [r.x, r.y],
      [r.x + r.w + g, r.y],
      [r.x + r.w + g - s * 2, r.y + r.h],
      [r.x, r.y + r.h],
    ];
  }
  const r = L[key];
  const leanRight = key === 'v1' || key === 'v2' || key === 'v5' || key === 'v6';
  if (leanRight) {
    return [
      [r.x + s, r.y],
      [r.x + r.w, r.y],
      [r.x + r.w - s, r.y + r.h],
      [r.x, r.y + r.h],
    ];
  }
  return [
    [r.x, r.y],
    [r.x + r.w - s, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x + s, r.y + r.h],
  ];
}

/** Bottom-left point of a polygon (max y, then min x) — where the role tag anchors. */
function polyBottomLeft(poly) {
  let best = poly[0];
  for (const p of poly) {
    if (p[1] > best[1] || (p[1] === best[1] && p[0] < best[0])) best = p;
  }
  return best;
}

function tracePoly(ctx, poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
}

/** Deterministic pseudo-random in [0,1) for a stable skyline and barcode. */
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

/** Draws one photo panel: cover-fit photo with zoom/pan, grade overlays, white border. */
function drawPhotoPanel(ctx, r, poly, panel, grade) {
  ctx.save();
  tracePoly(ctx, poly);
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
  // Uniform warm tint (sunset grade only): one warm cast across the whole panel so
  // bright-day and dark-night photos share a single sunset mood. The neon and the
  // subjects stay readable — the tint is light and the bottom wash does the rest.
  if (grade === GRADES.sunset) {
    ctx.fillStyle = 'rgba(255,122,45,0.10)';
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
    wash.addColorStop(0.6, 'rgba(255,90,40,0.15)');
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
  ctx.restore();
  // White inner border following the slanted edge.
  const lw = Math.max(2, Math.round(r.w * 0.004));
  ctx.save();
  tracePoly(ctx, poly);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.restore();
}

/** Cast-style role tag: a dark pill with a pink border at a panel's bottom-left. */
function drawRoleTag(ctx, r, poly, role, isHero) {
  const text = (role || '').trim().toUpperCase();
  if (!text) return;
  const tagH = isHero
    ? Math.max(20, Math.round(r.h * 0.052))
    : Math.max(13, Math.round(r.h * 0.058));
  const fs = Math.round(tagH * 0.52);
  ctx.save();
  ctx.font = `${fs}px ${DISPLAY}`;
  const tw = ctx.measureText(text).width;
  const padX = Math.round(tagH * 0.65);
  const pw = tw + padX * 2;
  const anchor = polyBottomLeft(poly);
  const inset = Math.max(4, Math.round(r.w * 0.03));
  const px = anchor[0] + inset;
  const py = r.y + r.h - tagH - inset;
  ctx.fillStyle = 'rgba(20,8,30,0.88)';
  roundRect(ctx, px, py, pw, tagH, tagH / 2);
  ctx.fill();
  ctx.strokeStyle = '#ff2d78';
  ctx.lineWidth = Math.max(1.5, tagH * 0.07);
  roundRect(ctx, px, py, pw, tagH, tagH / 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, px + pw / 2, py + tagH / 2 + fs * 0.04);
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
  const stripH = b.h * 0.035;
  const baseY = b.y + b.h;
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

/** Fits a font size so `text` fits maxW, shrinking down to a small floor. */
function fitSizeSmall(ctx, text, maxW, startSize, family, floor = 8) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > floor) {
    size -= 1;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

const DISPLAY = '"Archivo Black", "Arial Black", sans-serif';
/** Real script face for the subtitle (Great Vibes, vendored under app/fonts/). */
function scriptFont(size) {
  return `400 ${size}px "Great Vibes", Georgia, "Liberation Serif", serif`;
}
/** Italic serif for the review quote — a script face is unreadable at strip size. */
function quoteFont(size) {
  return `italic 700 ${size}px Georgia, "Liberation Serif", "DejaVu Serif", serif`;
}

/** Review-quote strip across the top: gold stars, italic quote, gazette name. */
function drawQuoteStrip(ctx, L, state, grade, w) {
  const q = L.quote;
  const quote = (state.quote || DEFAULT_QUOTE).trim();
  const gazette = (state.gazette || DEFAULT_GAZETTE).trim().toUpperCase();
  ctx.save();
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(q.x, q.y, q.w, q.h);
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(q.x, q.y + q.h - Math.max(2, Math.round(q.h * 0.06)), q.w, Math.max(2, Math.round(q.h * 0.06)));
  const cx = q.x + q.w / 2;
  const cy = q.y + q.h / 2;
  // Shrink the three segments together until they fit the strip.
  let starSize = Math.round(q.h * 0.42);
  let quoteSize = Math.round(q.h * 0.40);
  let gazSize = Math.round(q.h * 0.34);
  const full = `"${quote}" — ${gazette}`;
  for (let i = 0; i < 20; i++) {
    ctx.font = `${starSize}px ${DISPLAY}`;
    const sw = ctx.measureText('★★★★★ ').width;
    ctx.font = quoteFont(quoteSize);
    const qw = ctx.measureText(`"${quote}"`).width;
    ctx.font = `${gazSize}px ${DISPLAY}`;
    const gw = ctx.measureText(` — ${gazette}`).width;
    if (sw + qw + gw <= q.w * 0.96) break;
    starSize -= 1; quoteSize -= 1; gazSize -= 1;
  }
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `${starSize}px ${DISPLAY}`;
  const sw = ctx.measureText('★★★★★ ').width;
  ctx.font = scriptFont(quoteSize);
  const qw = ctx.measureText(`"${quote}"`).width;
  const total = sw + qw + ctx.measureText(` — ${gazette}`).width;
  let x = cx - total / 2;
  ctx.fillStyle = '#f5c542';
  ctx.font = `${starSize}px ${DISPLAY}`;
  ctx.fillText('★★★★★ ', x, cy + starSize * 0.04);
  x += sw;
  ctx.fillStyle = '#ffffff';
  ctx.font = quoteFont(quoteSize);
  ctx.fillText(`"${quote}"`, x, cy + quoteSize * 0.04);
  x += qw;
  ctx.fillStyle = grade.accent;
  ctx.font = `${gazSize}px ${DISPLAY}`;
  ctx.fillText(` — ${gazette}`, x, cy + gazSize * 0.04);
  ctx.restore();
}

function drawTitleBlock(ctx, L, state, grade, w) {
  const cx = L.inner.x + L.inner.w / 2;
  const title = (state.title || '').trim().toUpperCase() || 'SUNSET HEIST';
  const scriptSub = (state.scriptSub || DEFAULT_SCRIPT_SUB).trim();
  const sub = (state.subtitle || '').trim().toUpperCase();
  const badge = (state.badge || '').trim().toUpperCase();

  // Title: huge, gradient fill, thick dark outline, glow. Capped so its top sits at the
  // collage/banner seam — the role tags live in the collage just above it, and the title
  // must never paint over them.
  const maxW = L.inner.w * 0.97;
  const fitted = fitSize(ctx, title, maxW, Math.round(L.inner.w * 0.145), DISPLAY);
  const cap = Math.floor((L.banner.h * 0.52) / 0.84);
  const size = Math.min(fitted, cap);
  const baseline = L.collageBottom + 2 + Math.round(size * 0.72);
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
  ctx.lineWidth = size * 0.11;
  ctx.strokeText(title, cx, baseline);
  // Soft dark drop shadow under the fill, for a more three-dimensional title.
  ctx.shadowColor = 'rgba(20,8,30,0.5)';
  ctx.shadowBlur = size * 0.07;
  ctx.shadowOffsetY = size * 0.045;
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

  // Script subtitle: the real script face under the title, kept in the case it was
  // written. Bigger and white with a dark outline + soft shadow, so it pops off the
  // bright banner gradient instead of fading into it.
  if (scriptSub) {
    const scSize = Math.max(14, Math.round(L.banner.h * 0.20));
    ctx.save();
    ctx.font = scriptFont(scSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = scSize * 0.3;
    ctx.shadowOffsetY = scSize * 0.05;
    ctx.strokeStyle = 'rgba(20,8,30,0.6)';
    ctx.lineWidth = scSize * 0.05;
    ctx.strokeText(scriptSub, cx, L.collageBottom + L.banner.h * 0.66);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scriptSub, cx, L.collageBottom + L.banner.h * 0.66);
    ctx.restore();
  }

  // Tagline: spaced capitals below the script subtitle, inside the banner. Fitted so
  // a long tagline never runs past the frame at any export size.
  if (sub) {
    const maxSubW = L.inner.w * 0.96;
    let subSize = Math.max(12, Math.round(L.banner.h * 0.09));
    ctx.save();
    try { ctx.letterSpacing = `${Math.round(subSize * 0.25)}px`; } catch { /* older canvas */ }
    ctx.font = `${subSize}px ${DISPLAY}`;
    while (ctx.measureText(sub).width > maxSubW && subSize > 8) {
      subSize -= 1;
      try { ctx.letterSpacing = `${Math.round(subSize * 0.25)}px`; } catch { /* older canvas */ }
      ctx.font = `${subSize}px ${DISPLAY}`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = subSize * 0.25;
    ctx.fillStyle = grade.accent;
    ctx.fillText(sub, cx, L.collageBottom + L.banner.h * 0.745);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    ctx.restore();
  }
}

/** Barcode: white box with deterministic black bars and a small code line. */
function drawBarcode(ctx, x, y, bw, bh) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, bw, bh);
  const bars = 28;
  const codeH = Math.max(6, Math.round(bh * 0.22));
  const barAreaH = bh - codeH - 2;
  let bx = x + Math.max(2, bw * 0.06);
  const maxX = x + bw - Math.max(2, bw * 0.06);
  for (let i = 0; i < bars && bx < maxX; i++) {
    const barW = Math.max(1, Math.round((bw / bars) * (0.35 + rand(500 + i) * 0.9)));
    ctx.fillStyle = '#111111';
    ctx.fillRect(bx, y + 2, Math.min(barW, maxX - bx), barAreaH);
    bx += barW + Math.max(1, Math.round((bw / bars) * 0.45));
  }
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.max(6, codeH - 2)}px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 02113 122620', x + bw / 2, y + bh - codeH / 2 - 1);
  ctx.restore();
}

/** Billing block: COMING SOON left, production credit + STARRING cast (led by YOU) + a
 * SHOT ON YOUR OWN CAMERA credit centred, barcode right. Three lines, kept high
 * enough in the banner that the last line clears the bottom edge with margin. */
function drawBilling(ctx, L, state, grade, w) {
  const b = L.banner;
  const roles = (state.roles && state.roles.length === 7 ? state.roles : DEFAULT_ROLES)
    .map((r) => (r || '').trim().toUpperCase()).filter(Boolean);
  const line1 = 'A PALM BAY PICTURES PRODUCTION';
  const line2 = roles.length ? `STARRING YOU · ${roles.join(' · ')}` : '';
  const line3 = 'SHOT ON YOUR OWN CAMERA';
  const y1 = L.collageBottom + b.h * 0.805;
  const y2 = L.collageBottom + b.h * 0.86;
  const y3 = L.collageBottom + b.h * 0.915;
  const sidePad = Math.round(b.w * 0.02);

  // COMING SOON, left, vertically centred on the three billing lines.
  ctx.save();
  const soonSize = Math.max(11, Math.round(b.h * 0.085));
  ctx.font = `${soonSize}px ${DISPLAY}`;
  const soonW = ctx.measureText('COMING SOON').width;
  const soonX = b.x + sidePad;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = soonSize * 0.2;
  ctx.fillText('COMING SOON', soonX, (y1 + y3) / 2 + soonSize * 0.04);
  ctx.restore();

  // Barcode, right.
  const barW = Math.round(b.h * 0.52);
  const barH = Math.round(b.h * 0.16);
  const barX = b.x + b.w - sidePad - barW;
  const barY = L.collageBottom + b.h * 0.79;
  drawBarcode(ctx, barX, barY, barW, barH);

  // Billing lines, centred in the space between COMING SOON and the barcode, with a
  // clear gap on both sides so the long STARRING line never touches either.
  const maxW = barX - (soonX + soonW) - sidePad * 4;
  const cx = soonX + soonW + sidePad * 2 + maxW / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const s1 = fitSizeSmall(ctx, line1, maxW, Math.max(10, Math.round(b.h * 0.058)), DISPLAY);
  ctx.font = `${s1}px ${DISPLAY}`;
  ctx.fillText(line1, cx, y1);
  if (line2) {
    const s2 = fitSizeSmall(ctx, line2, maxW, Math.max(10, Math.round(b.h * 0.054)), DISPLAY);
    ctx.font = `${s2}px ${DISPLAY}`;
    ctx.fillText(line2, cx, y2);
  }
  const s3 = fitSizeSmall(ctx, line3, maxW, Math.max(10, Math.round(b.h * 0.052)), DISPLAY);
  ctx.font = `${s3}px ${DISPLAY}`;
  ctx.fillText(line3, cx, y3);
  ctx.restore();
}

/** Gold serrated seal: ORIGINAL COVER ART, stuck on the collage's bottom-right corner. */
function drawSeal(ctx, L, grade, w) {
  const r = Math.max(30, Math.round(w * 0.052));
  const cx = L.inner.x + L.inner.w - r;
  const cy = L.collageBottom - r * 0.85;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  drawStarburst(ctx, 0, 0, r, r * 0.86, 16, '#f5c542', '#8a6d1f');
  ctx.fillStyle = '#160a1e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.21)}px ${DISPLAY}`;
  ctx.fillText('ORIGINAL', 0, -r * 0.28);
  ctx.fillText('COVER ART', 0, r * 0.02);
  ctx.font = `${Math.round(r * 0.20)}px ${DISPLAY}`;
  ctx.fillText('★ ★ ★', 0, r * 0.36);
  ctx.restore();
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

  // Pink NEW circle on the bottom-right vignette (v6).
  const nr = Math.max(16, Math.round(w * 0.026));
  const ncx = L.v6.x + L.v6.w - nr - Math.round(w * 0.008);
  const ncy = L.v6.y + nr + Math.round(w * 0.008);
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
 * state: { grade, title, scriptSub, subtitle, badge, quote, gazette,
 *          roles: [7 role tags], panels: [{img, zoom, ox, oy} x7] }
 * opts: { selected } — a panel index to outline for the editor (never on export).
 */
export function drawPoster(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const L = posterLayout(w, h);
  const grade = GRADES[state.grade] || GRADES.sunset;
  const roles = (state.roles && state.roles.length === 7 ? state.roles : DEFAULT_ROLES);
  const keys = ['hero', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  drawQuoteStrip(ctx, L, state, grade, w);
  // Vignettes first, hero last so its slanted edge pops out over the column.
  for (let i = 1; i < 7; i++) {
    drawPhotoPanel(ctx, L[keys[i]], panelPoly(L, keys[i]), state.panels[i], grade);
  }
  drawPhotoPanel(ctx, L.hero, panelPoly(L, 'hero'), state.panels[0], grade);
  for (let i = 0; i < 7; i++) {
    drawRoleTag(ctx, L[keys[i]], panelPoly(L, keys[i]), roles[i], i === 0);
  }
  drawBanner(ctx, L.banner, grade);
  drawTitleBlock(ctx, L, state, grade, w);
  drawBilling(ctx, L, state, grade, w);
  drawSeal(ctx, L, grade, w);
  drawBadges(ctx, L, state, grade, w);
  // Thin gold frame around the whole cover.
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = L.frame;
  ctx.strokeRect(L.frame / 2, L.frame / 2, w - L.frame, h - L.frame);
  // Editor-only selection outline (never drawn on export).
  if (typeof opts.selected === 'number' && opts.selected >= 0) {
    const rects = [L.hero, L.v1, L.v2, L.v3, L.v4, L.v5, L.v6];
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
