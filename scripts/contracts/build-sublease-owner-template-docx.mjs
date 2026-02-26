import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';

const SRC = resolve('config/contracts/templates/contrato_subarriendo_propietario_template_v4.txt');
const OUT = resolve('config/contracts/templates/contrato_subarriendo_propietario_template_v5.docx');

const raw = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');

const headingRegex = /^(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO|SEPTIMO|OCTAVO|NOVENO|DÉCIMO|DECIMO|PERSONERÍA|PERSONERIA)/i;
const signatureLineRegex = /^_{5,}/;
const signatureMetaRegex = /^(Rut:|Arrendador|Arrendataria|pp\.)/i;

function paragraphFromLine(line, inSignatureBlock) {
  const trimmed = line.trim();

  if (!trimmed) {
    if (inSignatureBlock) {
      return {
        paragraph: new Paragraph({
          spacing: { after: 25 },
          keepNext: true,
          keepLines: true,
        }),
        inSignatureBlock,
      };
    }

    return {
      paragraph: new Paragraph({ spacing: { after: 140 } }),
      inSignatureBlock,
    };
  }

  if (
    !inSignatureBlock
    && (
      trimmed === 'CONTRATO DE ARRENDAMIENTO'
      || trimmed === 'A'
      || trimmed === '[[ARRENDADOR.NOMBRE]]'
      || trimmed === '[[ARRENDATARIA.RAZON_SOCIAL]]'
    )
  ) {
    return {
      paragraph: new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: trimmed,
          bold: true,
          font: 'Times New Roman',
          size: trimmed === 'A' ? 24 : 30,
        }),
      ],
      }),
      inSignatureBlock,
    };
  }

  if (headingRegex.test(trimmed)) {
    return {
      paragraph: new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
      spacing: { before: 220, after: 110 },
      children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 24 })],
      }),
      inSignatureBlock: false,
    };
  }

  if (/^\(i\)|^\(ii\)|^\(a\)|^\(b\)|^\(c\)|^\(d\)|^7\.1|^7\.2|^9\.1|^9\.2|^1\.1|^2\.1|^2\.2|^3\.1|^3\.2|^3\.3|^4\.1|^4\.2|^4\.3|^4\.4|^4\.5|^4\.6/.test(trimmed)) {
    return {
      paragraph: new Paragraph({
      spacing: { after: 90 },
      indent: { left: 360 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: trimmed, font: 'Times New Roman', size: 22 })],
      }),
      inSignatureBlock,
    };
  }

  if (signatureLineRegex.test(trimmed)) {
    return {
      paragraph: new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 40 },
        keepNext: true,
        keepLines: true,
        children: [new TextRun({ text: trimmed, font: 'Times New Roman', size: 22 })],
      }),
      inSignatureBlock: true,
    };
  }

  const shouldLeftAlign = inSignatureBlock || signatureMetaRegex.test(trimmed);
  const isSignatureEnd = inSignatureBlock && /^Arrendataria$/i.test(trimmed);
  const paragraph = new Paragraph({
    spacing: { after: inSignatureBlock ? 55 : 120 },
    alignment: shouldLeftAlign ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    keepNext: inSignatureBlock ? !isSignatureEnd : false,
    keepLines: inSignatureBlock,
    children: [new TextRun({ text: trimmed, font: 'Times New Roman', size: 22 })],
  });

  return {
    paragraph,
    inSignatureBlock,
  };
}

const children = [];
let inSignatureBlock = false;
for (const line of lines) {
  const result = paragraphFromLine(line, inSignatureBlock);
  children.push(result.paragraph);
  inSignatureBlock = result.inSignatureBlock;
}

const doc = new Document({
  styles: {
    default: {
      heading1: {
        run: { font: 'Times New Roman', size: 28, bold: true },
        paragraph: { spacing: { after: 140 } },
      },
      heading2: {
        run: { font: 'Times New Roman', size: 24, bold: true },
        paragraph: { spacing: { before: 220, after: 110 } },
      },
      document: {
        run: { font: 'Times New Roman', size: 22 },
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 320, after: 120 },
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1417,
            right: 1417,
            bottom: 1417,
            left: 1417,
          },
        },
      },
      children,
    },
  ],
});

mkdirSync(dirname(OUT), { recursive: true });
const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);

console.log(`Generated: ${OUT}`);
