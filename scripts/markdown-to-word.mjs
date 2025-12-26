import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';

// Configurar marked para parsear correctamente
marked.setOptions({
  gfm: true,
  breaks: true,
});

async function convertMarkdownToWord(markdownPath, outputPath) {
  // Leer el archivo Markdown
  const markdownContent = readFileSync(markdownPath, 'utf-8');
  
  // Parsear Markdown a tokens
  const tokens = marked.lexer(markdownContent);
  
  const children = [];
  
  // Convertir tokens a elementos de Word
  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        const level = token.depth;
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1 :
                            level === 2 ? HeadingLevel.HEADING_2 :
                            level === 3 ? HeadingLevel.HEADING_3 :
                            level === 4 ? HeadingLevel.HEADING_4 :
                            level === 5 ? HeadingLevel.HEADING_5 :
                            HeadingLevel.HEADING_6;
        
        const headingText = token.tokens ? 
          token.tokens.map(t => t.text || '').join('') : 
          token.text || '';
        
        children.push(
          new Paragraph({
            text: headingText,
            heading: headingLevel,
            spacing: { after: 200 },
          })
        );
        break;
        
      case 'paragraph':
        const paraText = token.tokens ? 
          convertTokensToRuns(token.tokens) : 
          [new TextRun(token.text || '')];
        
        children.push(
          new Paragraph({
            children: paraText,
            spacing: { after: 120 },
          })
        );
        break;
        
      case 'list':
        if (token.ordered) {
          // Lista ordenada
          token.items.forEach((item, index) => {
            const itemText = item.tokens ? 
              convertTokensToRuns(item.tokens) : 
              [new TextRun(item.text || '')];
            
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true }),
                  ...itemText,
                ],
                spacing: { after: 100 },
              })
            );
          });
        } else {
          // Lista no ordenada
          token.items.forEach(item => {
            const itemText = item.tokens ? 
              convertTokensToRuns(item.tokens) : 
              [new TextRun(item.text || '')];
            
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: '• ', bold: true }),
                  ...itemText,
                ],
                spacing: { after: 100 },
              })
            );
          });
        }
        break;
        
      case 'table':
        const tableRows = [];
        
        // Header row
        if (token.header) {
          const headerCells = token.header.map(cell => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: cell.text || '', bold: true })],
              })],
              width: { size: 20, type: WidthType.PERCENTAGE },
            })
          );
          tableRows.push(new TableRow({ children: headerCells }));
        }
        
        // Data rows
        token.rows.forEach(row => {
          const cells = row.map(cell =>
            new TableCell({
              children: [new Paragraph({
                children: convertTokensToRuns(cell.tokens || []),
              })],
              width: { size: 20, type: WidthType.PERCENTAGE },
            })
          );
          tableRows.push(new TableRow({ children: cells }));
        });
        
        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        break;
        
      case 'code':
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: token.text || '',
              font: 'Courier New',
            })],
            spacing: { after: 120 },
          })
        );
        break;
        
      case 'hr':
        children.push(
          new Paragraph({
            text: '─'.repeat(50),
            spacing: { before: 200, after: 200 },
          })
        );
        break;
        
      default:
        // Para otros tipos de tokens, intentar convertir el texto
        if (token.text) {
          children.push(
            new Paragraph({
              children: [new TextRun(token.text)],
              spacing: { after: 120 },
            })
          );
        }
    }
  }
  
  // Crear el documento Word
  const doc = new Document({
    sections: [{
      children: children,
    }],
  });
  
  // Generar el archivo .docx
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);
  
  console.log(`✅ Documento Word creado exitosamente: ${outputPath}`);
}

function convertTokensToRuns(tokens) {
  const runs = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        runs.push(new TextRun(token.text || ''));
        break;
        
      case 'strong':
        const strongText = token.tokens ? 
          token.tokens.map(t => t.text || '').join('') : 
          token.text || '';
        runs.push(new TextRun({ text: strongText, bold: true }));
        break;
        
      case 'em':
        const emText = token.tokens ? 
          token.tokens.map(t => t.text || '').join('') : 
          token.text || '';
        runs.push(new TextRun({ text: emText, italics: true }));
        break;
        
      case 'code':
        runs.push(new TextRun({ 
          text: token.text || '',
          font: 'Courier New',
        }));
        break;
        
      case 'link':
        const linkText = token.tokens ? 
          token.tokens.map(t => t.text || '').join('') : 
          token.text || token.href || '';
        runs.push(new TextRun({ 
          text: linkText,
          color: '0066CC',
          underline: {},
        }));
        break;
        
      default:
        if (token.text) {
          runs.push(new TextRun(token.text));
        }
    }
  }
  
  return runs.length > 0 ? runs : [new TextRun('')];
}

// Ejecutar la conversión
const markdownPath = join(process.cwd(), 'docs', 'FICHA_TECNICA_MVP.md');
const outputPath = join(process.cwd(), 'docs', 'FICHA_TECNICA_MVP.docx');

convertMarkdownToWord(markdownPath, outputPath)
  .then(() => {
    console.log('✅ Conversión completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error al convertir:', error);
    process.exit(1);
  });







