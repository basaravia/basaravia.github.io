# Alexander Saravia — personal site

Static bilingual (Spanish/English) portfolio for `https://aisaravia.online/`.

## Pages

- `index.html` — home: featured case, track record summary, lab, talks, notes, toolkit.
- `caso-agente.html` — case study of the generative AI agent.
- `trayectoria.html` — experience, recognition, publications, education, certifications, community.
- `blog/` — notes. Copy `blog/_plantilla.html` to `blog/<slug>.html` and list it in `data/contenido.js`.

## Content

- `data/contenido.js` — gallery (talks, classes, events) and blog notes. Sections stay hidden while empty.
- `assets/icons.svg` — technology logos from [Simple Icons](https://simpleicons.org) (CC0) and
  [Devicon](https://devicon.dev) (MIT). Trademarks belong to their owners.
- `assets/img/` — published images. Photo workflow below.

## Photos

Originals go in `fotos_entrada/` (ignored by git). A photo is published only after it is listed in
`assets/img/aprobadas.txt` and processed with `tools/preparar_fotos.py`, which strips EXIF/GPS metadata,
resizes it and adds a watermark (`pip install pillow`).

## Deploy

The `main` branch is deployed to GitHub Pages by `.github/workflows/pages.yml`. The workflow runs
`tools/publicar.py`, which fails on unapproved images, image metadata or personal contact data, and
publishes only the public files. The custom domain is declared in `CNAME`.

## Local preview

Run `python3 -m http.server` in this folder and open `http://localhost:8000` (the logo sprite does not
load from `file://`).

## Easter eggs

- Open the terminal from the hero or footer and try `help`, `offroad`, `playlist`, or
  `sudo make me a sandwich`.
- Enter the Konami code to reveal a small message.
