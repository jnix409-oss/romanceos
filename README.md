# Romance Story OS

Live: https://romance-story-os.netlify.app (Netlify project `romance-story-os`)

## What's here

| Path | What it is |
|---|---|
| `site/` | The deployable app (July 2026 "Private Edition" build). No build step. |
| `netlify/functions/anthropic.mjs` | Server proxy: checks the app password, forwards to Anthropic. |
| `netlify.toml` | Routes `/api/anthropic/*` to the function. **Required** — without it generation 404s. |
| `recovered-source/app.js` | Readable (de-minified) source of the current build. Edit this, then rebuild. |
| `recovered-source/app.original.pretty.js` | The July build exactly as recovered from the live site, before fixes. |
| `recovered-source/patch.py` | The fixes applied on 2026-09-27 (as a script, for reference). |
| `archive/may-2026-source/` | Older May 31 Vite/React source. Superseded; kept for reference. |

The original July source files were lost with a laptop; this build was recovered
from the live bundle on 2026-09-27.

## Rebuild after editing `recovered-source/app.js`

```
npx esbuild recovered-source/app.js --minify --format=esm --outfile=site/assets/index-contemporary-black-romance.js
```

## Deploy

Always deploy from the repo root (so `netlify.toml` and the function are included):

```
npx netlify-cli deploy --prod --site romance-story-os
```

Do **not** drag-and-drop the `site/` folder into Netlify — that skips the function and the route.

## Netlify environment variables

- `ANTHROPIC_API_KEY` — functions scope
- `STORY_OS_ACCESS_TOKEN` — functions scope; this is the password the app asks for
