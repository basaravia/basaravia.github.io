#!/usr/bin/env python3
"""Verifica el sitio y arma la carpeta que se publica en GitHub Pages.

  python tools/publicar.py _site

Falla (y no se publica nada) si:
- hay una imagen en assets/img que no está en assets/img/aprobadas.txt;
- una imagen conserva metadatos EXIF, GPS o XMP;
- una página pública contiene un correo o un teléfono.
Solo se copian los archivos públicos: nada de tools/ ni plantillas.
"""
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "trayectoria.html", "caso-agente.html", "styles.css", "app.js", "favicon.svg", "CNAME", ".nojekyll", "robots.txt", "sitemap.xml"]
FOLDERS = ["assets", "data", "blog"]
PRIVATE = re.compile(r"(^|/)(_[^/]*|LEEME\.md|aprobadas\.txt|\.DS_Store)$")
IMAGE_SUFFIXES = {".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"}
PERSONAL = [r"[\w.+-]+@[\w-]+\.[\w.]+", r"\+?593[\s-]?9\d[\s-]?\d{3}[\s-]?\d{4}", r"\b09\d{8}\b"]


def public_files():
    for name in PAGES:
        yield ROOT / name
    for folder in FOLDERS:
        for path in sorted((ROOT / folder).rglob("*")):
            if path.is_file() and not PRIVATE.search(path.relative_to(ROOT).as_posix()):
                yield path


def check(files):
    errors = []
    approved = {line.strip() for line in (ROOT / "assets/img/aprobadas.txt").read_text().splitlines()
                if line.strip() and not line.startswith("#")}
    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        if path.suffix.lower() in {".heic", ".heif"}:
            errors.append(f"{rel}: HEIC original (trae GPS y datos del iPhone); conviértela con tools/preparar_fotos.py")
            continue
        if path.suffix.lower() in IMAGE_SUFFIXES and rel.startswith("assets/img/"):
            if rel.removeprefix("assets/img/") not in approved:
                errors.append(f"{rel}: imagen sin aprobar (agrégala a assets/img/aprobadas.txt tras revisarla)")
            with Image.open(path) as image:
                meta = {k for k in ("exif", "xmp", "XML:com.adobe.xmp") if image.info.get(k)}
                if image.getexif():
                    meta.add("exif")
                if meta:
                    errors.append(f"{rel}: conserva metadatos ({', '.join(sorted(meta))}); pásala por tools/preparar_fotos.py")
        if path.suffix in {".html", ".js", ".css", ".svg"}:
            text = path.read_text()
            for pattern in PERSONAL:
                for hit in set(re.findall(pattern, text)):
                    errors.append(f"{rel}: dato personal publicado ({hit})")
    return errors


def main(out):
    files = list(public_files())
    errors = check(files)
    if errors:
        print("No se publica:\n- " + "\n- ".join(errors), file=sys.stderr)
        sys.exit(1)
    out = Path(out)
    shutil.rmtree(out, ignore_errors=True)
    for path in files:
        target = out / path.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
    print(f"{len(files)} archivos verificados en {out}/")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "_site")
