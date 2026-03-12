# Asset & Content Guide

All static resources now live under `public/assets` so they are shipped with the build and respect the Vite `base` path (`/rcv_website/`). Use the helpers in `src/utils/paths.ts` (`getAssetUrl`, `getContentUrl`) whenever you reference files to avoid broken URLs after deployment.

## Directory layout
- `public/assets/media/` — images, icons, hero slides, author research figures  
  - `home_slides/` — hero and team carousel backgrounds  
  - `authors_research/` — research figures used inside author bios (includes `default_avatar.png`)  
  - `icons/` — shared SVG/PNG icons  
- `public/assets/docs/` — Markdown snippets surfaced in the UI (home intro, alumni lists)
- `public/assets/data/` — structured data files (for example `publications.bib`)

## Adding or updating assets
1. Place the new file in the matching `public/assets/...` folder. Keep names lowercase with underscores to match existing content.
2. Reference it with helpers:
   - Images: `getAssetUrl('media/home_slides/example.jpg')`
   - Docs: `getAssetUrl('docs/home_en.md')`
   - Content files already under `public/content/...`: `getContentUrl('authors/Name/_index.md')`
3. Commit only the files you added. Large, unused, or experimental files should go in `trash/` for manual review.

## Image Optimization (Important)
Large unoptimized imagery (e.g. 5~10MB) can freeze the UI and create jagged scrolling. A utility script is provided to automatically losslessly optimize image assets without breaking aspect ratios:
- Run `npm run images:compress` from the project root.
- The script uses `sharp` to safely downsample images > 500KB to Web-friendly sizes (e.g., maximum 1920px for hero carousels and 640px for author avatars), reducing sizes by ~80% with invisible quality loss.
- **GIFs**: Large animated GIFs (>2MB) should be converted to highly compressed MP4 videos since our React Markdown engine seamlessly auto-plays them natively without controls: `npm run images:convert-gifs`.

## Home and alumni Markdown
- Home intro: `public/assets/docs/home_zh.md`, `public/assets/docs/home_en.md`
- Alumni list: `public/assets/docs/alumni_zh.md`, `public/assets/docs/alumni_en.md`
Updating these files is enough—the components load them at runtime via `getAssetUrl`.

## Hero and team carousels
- Add hero images to `public/assets/media/home_slides/`.
- Configure slides in `src/utils/config.ts` (or `config.toml` for future use) with `getAssetUrl('media/home_slides/<file>')`.

## Author media
- Author profile markdown under `public/content/authors/<ID>/_index.md` can embed images.
- For shared research figures, drop them in `public/assets/media/authors_research/` and reference `authors_research/<file>` inside markdown; the renderer will resolve it with the proper base path.
- Each author can also keep per-profile files in their own `public/content/authors/<ID>/` folder and link to them directly.

## Publications data
- Update the BibTeX source at `public/assets/data/publications.bib`. It is fetched at runtime and parsed in `src/utils/bibParser.ts`.

## Trash folder
Stale or unused resources live in `trash/` for manual cleanup. Do not deploy from there; move items back into `public/assets` only after confirming they are needed.
