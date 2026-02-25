#!/usr/bin/env python3
"""
Build a styled DOCX contract template from the text source.

Usage:
  python3 scripts/contracts/build-contract-template-docx.py
"""

from pathlib import Path
import re

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt


ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "config/contracts/templates/contrato_arrendamiento_template_v1.txt"
OUT = ROOT / "config/contracts/templates/contrato_arrendamiento_template_v1.docx"


def main() -> None:
    lines = SRC.read_text(encoding="utf-8").splitlines()
    doc = Document()

    section = doc.sections[0]
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal.font.size = Pt(11)

    heading_re = re.compile(
        r"^(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SEPTIMO|OCTAVO|NOVENO|DECIMO(\s+\w+)?|DECLARACION DE )"
    )
    centered_tokens = {
        "CONTRATO DE ARRENDAMIENTO",
        "CON",
        "[[ARRENDADORA.RAZON_SOCIAL]]",
        "[[ARRENDATARIO.NOMBRE]]",
    }
    account_prefixes = (
        "Titular:",
        "RUT:",
        "Banco:",
        "Tipo de cuenta:",
        "Numero de cuenta:",
        "Correo de pago:",
    )

    for line in lines:
        p = doc.add_paragraph("")
        text = line.rstrip("\n")

        if not text.strip():
            p.paragraph_format.space_after = Pt(8)
            continue

        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)

        if text in centered_tokens:
            run = p.add_run(text)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run.bold = True
            if text == "CONTRATO DE ARRENDAMIENTO":
                run.font.size = Pt(16)
                p.paragraph_format.space_after = Pt(14)
            elif text == "CON":
                run.font.size = Pt(12)
                run.italic = True
            else:
                run.font.size = Pt(13)
            continue

        if heading_re.match(text):
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(12)
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            continue

        if text.startswith("_________________________"):
            run = p.add_run(text)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run.bold = True
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(2)
            continue

        if re.match(r"^[a-z]\)", text):
            p.paragraph_format.left_indent = Cm(0.6)
            p.paragraph_format.first_line_indent = Cm(-0.2)
        elif text.startswith("- "):
            p.paragraph_format.left_indent = Cm(0.8)
            p.paragraph_format.first_line_indent = Cm(-0.2)

        if ":" in text and text.startswith(account_prefixes):
            label, rest = text.split(":", 1)
            label_run = p.add_run(f"{label}:")
            label_run.bold = True
            p.add_run(rest)
        else:
            p.add_run(text)

    if doc.paragraphs and not doc.paragraphs[0].text.strip():
        first = doc.paragraphs[0]._element
        first.getparent().remove(first)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(f"OK: {OUT}")


if __name__ == "__main__":
    main()

