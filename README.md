# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Freshaaaa/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Freshaaaa/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover — turn photos + a caption into GTA-style poster art. A multi-panel collage (pop-out hero with a slanted edge + six vignettes in staggered rows with alternating slants, 11 sample photos, every panel showing a person) with a review-quote strip, cast-style role tags on every panel, a huge gradient title, a script subtitle, a sunset banner with skyline and palms, a billing block (COMING SOON, production credit + STARRING cast, barcode), a gold ORIGINAL COVER ART seal, decorative badges, 3 color grades (Vice Sunset / Neon Nights / Vice Noir), and PNG export in 3 sizes (1080x1080, 1080x1350, 1920x1080). Per-panel photo upload (client-side, FileReader — nothing leaves the browser), drag-to-pan, per-panel zoom sliders, editable title / script subtitle / tagline / badge / quote / gazette / role tags (the tags also fill the STARRING billing line).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

Build the entry's dossier (what the judge reads) with:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` first validates the inputs it ships — the cover module, every sample photo the seven panels load, and every screenshot `shots.json` names — and refuses to build, naming the missing file, instead of handing in a broken build.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pstpm556&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
