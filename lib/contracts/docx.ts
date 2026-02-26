import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ContractError } from './contract-error';

const XML_FILES = [
  'word/document.xml',
  'word/header1.xml',
  'word/header2.xml',
  'word/header3.xml',
  'word/footer1.xml',
  'word/footer2.xml',
  'word/footer3.xml',
];

function enforceParagraphJustification(xml: string): string {
  return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (paragraph) => {
    if (/<w:jc\b/.test(paragraph)) {
      return paragraph;
    }

    if (/<w:pPr>/.test(paragraph)) {
      return paragraph.replace('<w:pPr>', '<w:pPr><w:jc w:val="both"/>');
    }

    return paragraph.replace(/<w:p([^>]*)>/, '<w:p$1><w:pPr><w:jc w:val="both"/></w:pPr>');
  });
}

export interface RenderDocxInput {
  sourceDocxBuffer: Buffer;
  transformXml: (xml: string) => string;
}

export interface RenderDocxResult {
  renderedDocxBuffer: Buffer;
  mergedXmlContent: string;
}

export function renderDocxTemplate({ sourceDocxBuffer, transformXml }: RenderDocxInput): RenderDocxResult {
  const workingDir = mkdtempSync(join(tmpdir(), 'contract-docx-'));
  const sourcePath = join(workingDir, 'source.docx');
  const extractDir = join(workingDir, 'extracted');
  const outPath = join(workingDir, 'rendered.docx');

  try {
    writeFileSync(sourcePath, sourceDocxBuffer);
    mkdirSync(extractDir, { recursive: true });

    execFileSync('unzip', ['-qq', sourcePath, '-d', extractDir]);

    const transformedXmlPieces: string[] = [];
    for (const relPath of XML_FILES) {
      const absPath = join(extractDir, relPath);
      try {
        const xml = readFileSync(absPath, 'utf8');
        const transformedBase = transformXml(xml);
        const transformed =
          relPath === 'word/document.xml'
            ? enforceParagraphJustification(transformedBase)
            : transformedBase;
        transformedXmlPieces.push(transformed);
        writeFileSync(absPath, transformed, 'utf8');
      } catch {
        // optional xml file missing
      }
    }

    execFileSync('zip', ['-qr', outPath, '.'], { cwd: extractDir });

    const renderedDocxBuffer = readFileSync(outPath);
    return {
      renderedDocxBuffer,
      mergedXmlContent: transformedXmlPieces.join('\n'),
    };
  } catch (error) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: 'No se pudo renderizar la plantilla DOCX',
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    rmSync(workingDir, { recursive: true, force: true });
  }
}
