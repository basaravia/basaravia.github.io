#!/usr/bin/env python3
"""Prepara una foto aprobada para la web: sin metadatos (EXIF/GPS), lado mayor de 1600 px y marca de agua.

Uso:
  python tools/preparar_fotos.py fotos_entrada/IMG_1234.HEIC charlas/2026-python-quito-owasp
  python tools/preparar_fotos.py foto.HEIC eventos/2024-dama --recortar 0,0.1,1,0.9 --ocultar 0.6,0.2,0.9,0.4
  python tools/preparar_fotos.py foto.HEIC --previa /tmp/previa.jpg     # vista con cuadrícula, no publica
  python tools/preparar_fotos.py foto.HEIC retrato/x --margen-superior 0.12  # aire sobre la cabeza

Las coordenadas son fracciones del ancho y del alto (x0,y0,x1,y1, de 0 a 1) sobre la foto ya girada.
--recortar se aplica primero; las zonas de --ocultar se miden sobre el resultado del recorte y se
pixelan de forma irreversible (no es un desenfoque suave).

Solo publica fotos cuyo destino (p. ej. charlas/2026-python-quito-owasp.webp) aparece en
assets/img/aprobadas.txt. Esa lista la mantiene Alexander después de la revisión del guardián de marca.
Requiere Pillow: python3 -m venv .venv && .venv/bin/pip install pillow
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
MAX_SIDE = 1600
PORTRAIT_SIDE = 800  # un retrato en alta resolución es materia prima para deepfakes
WATERMARK = "aisaravia.online"
KINDS = {"charlas", "clases", "eventos", "blog", "proyectos", "retrato"}


def approved():
    lines = (IMG / "aprobadas.txt").read_text().splitlines()
    return {line.strip() for line in lines if line.strip() and not line.startswith("#")}


def open_image(source):
    """Abre la foto; las HEIC del iPhone se convierten antes con sips (incluido en macOS)."""
    if Path(source).suffix.lower() not in {".heic", ".heif"}:
        return Image.open(source)
    converted = Path(tempfile.mkdtemp()) / "foto.jpg"
    subprocess.run(["sips", "-s", "format", "jpeg", source, "--out", str(converted)], check=True, capture_output=True)
    return Image.open(converted)


def region(spec):
    values = [float(v) for v in spec.split(",")]
    if len(values) != 4 or not all(0 <= v <= 1 for v in values) or values[0] >= values[2] or values[1] >= values[3]:
        raise argparse.ArgumentTypeError(f"zona inválida: {spec} (usa x0,y0,x1,y1 entre 0 y 1)")
    return values


def pixels(image, area):
    w, h = image.size
    return (int(area[0] * w), int(area[1] * h), int(area[2] * w), int(area[3] * h))


def hide(image, area):
    """Pixela con bloques grandes y luego difumina: el contenido original no se puede recuperar."""
    box = pixels(image, area)
    patch = image.crop(box)
    block = max(12, min(patch.size) // 6)
    small = patch.resize((max(1, patch.width // block), max(1, patch.height // block)), Image.BILINEAR)
    image.paste(small.resize(patch.size, Image.NEAREST).filter(ImageFilter.GaussianBlur(block // 2)), box)


def headroom(image, fraction):
    """Agrega aire arriba con el color del borde superior, fundido hacia la foto (para selfies muy justas)."""
    extra = int(image.height * fraction)
    band = image.crop((0, 0, image.width, max(1, image.height // 40))).resize((1, 1), Image.BOX).getpixel((0, 0))
    canvas = Image.new("RGB", (image.width, image.height + extra), band)
    canvas.paste(image, (0, extra))
    fade = Image.linear_gradient("L").resize((image.width, extra * 2))
    canvas.paste(Image.new("RGB", (image.width, extra * 2), band), (0, extra // 2), fade.transpose(Image.FLIP_TOP_BOTTOM).point(lambda v: v * 0.9))
    return canvas


def grid(image):
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=max(14, image.width // 50))
    for i in range(1, 10):
        x, y = image.width * i // 10, image.height * i // 10
        draw.line((x, 0, x, image.height), fill=(255, 255, 0), width=2)
        draw.line((0, y, image.width, y), fill=(255, 255, 0), width=2)
        draw.text((x + 4, 4), f".{i}", fill=(255, 255, 0), font=font)
        draw.text((4, y + 4), f".{i}", fill=(255, 255, 0), font=font)


def watermark(image):
    draw = ImageDraw.Draw(image, "RGBA")
    font = ImageFont.load_default(size=max(14, image.width // 60))
    box = draw.textbbox((0, 0), WATERMARK, font=font)
    margin = image.width // 50
    position = (image.width - box[2] - margin, image.height - box[3] - margin)
    draw.text((position[0] + 1, position[1] + 1), WATERMARK, font=font, fill=(0, 0, 0, 110))
    draw.text(position, WATERMARK, font=font, fill=(255, 255, 255, 150))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source")
    parser.add_argument("target", nargs="?")
    parser.add_argument("--recortar", type=region)
    parser.add_argument("--ocultar", type=region, action="append", default=[])
    parser.add_argument("--margen-superior", type=float, default=0, help="fracción de alto a agregar sobre la foto (0-0.3)")
    parser.add_argument("--previa", help="escribe una vista con cuadrícula en esta ruta (fuera del repo) y no publica")
    args = parser.parse_args()

    image = ImageOps.exif_transpose(open_image(args.source)).convert("RGB")
    if args.recortar:
        image = image.crop(pixels(image, args.recortar))
    for area in args.ocultar:
        hide(image, area)
    if args.margen_superior:
        image = headroom(image, min(args.margen_superior, 0.3))
    image.thumbnail((MAX_SIDE, MAX_SIDE))

    if args.previa:
        if Path(args.previa).resolve().is_relative_to(ROOT):
            sys.exit("La vista previa debe guardarse fuera del repo.")
        image.thumbnail((1100, 1100))
        grid(image)
        image.save(args.previa, "JPEG", quality=85)
        print(f"Vista previa: {args.previa}")
        return

    if not args.target:
        sys.exit("Falta el destino (p. ej. charlas/2026-python-quito-owasp).")
    target = args.target.removesuffix(".webp") + ".webp"
    if target.split("/")[0] not in KINDS:
        sys.exit(f"El destino debe empezar por una de estas carpetas: {', '.join(sorted(KINDS))}")
    if target not in approved():
        sys.exit(f"'{target}' no está en assets/img/aprobadas.txt. Revisa la foto con el guardián y apruébala primero.")

    if target.startswith("retrato/"):
        image.thumbnail((PORTRAIT_SIDE, PORTRAIT_SIDE))
    watermark(image)
    output = IMG / target
    output.parent.mkdir(parents=True, exist_ok=True)
    # Se guarda una imagen nueva sin exif ni icc: no viaja ningún metadato del original.
    image.save(output, "WEBP", quality=80, method=6)
    print(f"Lista: assets/img/{target} ({image.width}×{image.height}, sin metadatos)")


if __name__ == "__main__":
    main()
