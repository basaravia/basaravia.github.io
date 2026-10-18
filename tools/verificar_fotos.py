#!/usr/bin/env python3
"""Verifica fotos ya procesadas con Vision (Neural Engine / GPU del Mac): OCR y detección de rostros.

  python3 tools/verificar_fotos.py assets/img/charlas/*.webp

Marca cualquier texto legible que parezca un teléfono, un correo, un usuario o equipo de terminal,
un término de la lista definida en la variable GUARDIAN_POLICY (opcional) o un nombre interno, y cuenta los rostros de cada foto.
Sale con código 1 si hay alertas. Compila tools/verificar_fotos.swift la primera vez (requiere Xcode CLT).
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "verificar_fotos.swift"
BINARY = ROOT / ".venv" / "verificar_fotos"
PRIVATE_POLICY = Path(os.environ.get("GUARDIAN_POLICY", ""))
PATTERNS = {
    "teléfono": r"\+?\d[\d\s-]{7,}\d",
    "correo": r"[\w.+-]+@[\w-]+\.[a-z]{2,}",
    "terminal": r"\w+@[\w-]+-(MacBook|iMac|Mac)[\w-]*|\b[\w-]+-MacBook-[\w-]+",
    "dato interno": r"\b(cat[aá]logo|tabla|campo|schema|select .* from|intranet|uso interno|confidencial)\b",
}


def binary():
    if not BINARY.exists() or BINARY.stat().st_mtime < SOURCE.stat().st_mtime:
        BINARY.parent.mkdir(exist_ok=True)
        subprocess.run(["swiftc", "-O", str(SOURCE), "-o", str(BINARY)], check=True)
    return BINARY


def policy_patterns():
    try:
        policy = json.loads(PRIVATE_POLICY.read_text()) if PRIVATE_POLICY.is_file() else None
    except OSError:
        policy = None
    if policy is None:
        return {}
    return {"política privada": "|".join(policy["secrets_block"] + policy["review_terms"]["terms"])}


def main(paths):
    if not paths:
        sys.exit(__doc__)
    patterns = PATTERNS | policy_patterns()
    out = subprocess.run([str(binary()), *paths], check=True, capture_output=True, text=True).stdout
    alerts = 0
    for line in out.splitlines():
        result = json.loads(line)
        text = " | ".join(result["text"])
        hits = [f"{kind}: «{m.group(0)}»" for kind, p in patterns.items() for m in re.finditer(p, text, re.I)
                # un teléfono tiene al menos 8 dígitos (descarta años como «2024 - 2025»)
                if kind != "teléfono" or (sum(c.isdigit() for c in m.group(0)) >= 8
                                          and not re.fullmatch(r"(19|20)\d\d\s*-\s*(19|20)\d\d", m.group(0)))]
        alerts += bool(hits)
        path = Path(result["file"])
        name = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
        print(f"{'ALERTA' if hits else 'ok    '} {name}  rostros={len(result['faces'])}  textos={len(result['text'])}")
        for hit in hits:
            print(f"         {hit}")
    sys.exit(1 if alerts else 0)


if __name__ == "__main__":
    main([str(Path(p).resolve()) for p in sys.argv[1:]])
