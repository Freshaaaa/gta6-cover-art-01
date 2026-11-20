// Vice Cover — a gta6-cover-art-01 entry (Node 22, standard library only): the app is this directory's
// app/ folder, plain static files a desktop browser loads offline (app/index.html and its ES modules, no
// library and no network request), and the program hands it in. It copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. The app: photos + a caption become GTA-style poster art — a 7-panel collage (pop-out
// hero with a slanted edge + six vignettes in staggered rows with alternating slants, 11 sample photos,
// every panel showing a person) with a review-quote strip, cast-style role tags on every panel, a huge
// gradient title, a script subtitle, a sunset banner with skyline and palms, a billing block (COMING SOON,
// production credit + STARRING cast, barcode), a gold ORIGINAL COVER ART seal, decorative badges, 3 color
// grades (Vice Sunset / Neon Nights / Vice Noir), and PNG export in 3 sizes (1080x1080, 1080x1350,
// 1920x1080). Put your 4 PNG or JPEG screenshots in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate before copying: the dossier is only as good as the files it ships. Check the inputs the judge
// actually reads — the cover module, every sample photo the seven panels load (v2: the wheelman and the
// rider replaced the person-less sportscar panel and the duplicate neon-street panel), and every screenshot
// shots.json names — and stop with the missing item's name instead of handing in a broken build.
const panelPhotos = ['boulevard', 'policecar', 'gangster', 'jablay', 'policeofficer', 'wheelman', 'rider'];
const required = [
  join(here, 'app', 'src', 'cover.js'),
  ...panelPhotos.map((name) => join(here, 'app', 'samples', `${name}.jpg`)),
];
for (const shot of JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'))) {
  required.push(join(here, 'screenshots', shot.name));
}
const missing = required.filter((path) => !existsSync(path));
if (missing.length > 0) {
  console.error(`main.ts: refusing to build — ${missing.length} required file(s) missing:`);
  for (const path of missing) console.error(`  ${path}`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
