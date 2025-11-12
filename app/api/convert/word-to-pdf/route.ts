import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Helper to parse simple HTML to structured content
function parseHtmlContent(html: string): Array<{ type: string; content: string; level?: number }> {
  const elements: Array<{ type: string; content: string; level?: number }> = [];
  
  // Remove extra whitespace and split by tags
  const cleaned = html.replace(/\s+/g, ' ').trim();
  
  // Extract headings (h1-h6)
  const headingRegex = /<h([1-6])>(.*?)<\/h\1>/gi;
  let lastIndex = 0;
  let match;
  
  while ((match = headingRegex.exec(cleaned)) !== null) {
    // Add text before heading
    if (match.index > lastIndex) {
      const textBefore = cleaned.substring(lastIndex, match.index);
      const paragraphs = textBefore.split(/<\/?p>/gi).filter(p => p.trim());
      paragraphs.forEach(p => {
        if (p.trim()) elements.push({ type: 'paragraph', content: p.trim() });
      });
    }
    
    elements.push({
      type: 'heading',
      content: match[2].replace(/<[^>]+>/g, '').trim(),
      level: parseInt(match[1])
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < cleaned.length) {
    const remaining = cleaned.substring(lastIndex);
    const paragraphs = remaining.split(/<\/?p>/gi).filter(p => p.trim());
    paragraphs.forEach(p => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (text) elements.push({ type: 'paragraph', content: text });
    });
  }
  
  return elements.length > 0 ? elements : [{ type: 'paragraph', content: cleaned.replace(/<[^>]+>/g, '').trim() }];
}

// Function to convert Word to PDF using mammoth (DOCX → HTML) and pdf-lib (structured PDF)
async function convertWordToPDF(wordBuffer: Buffer): Promise<Buffer> {
  try {
    // Step 1: Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ buffer: wordBuffer });
    const html = result.value;
    
    if (!html || html.trim().length === 0) {
      throw new Error('Não foi possível extrair conteúdo do documento Word');
    }

    // Step 2: Parse HTML into structured content
    const elements = parseHtmlContent(html);

    // Step 3: Create PDF with pdf-lib
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    // Render each element
    for (const element of elements) {
      let fontSize = 12;
      let currentFont = font;
      let lineHeight = fontSize * 1.5;
      
      if (element.type === 'heading') {
        // Adjust font size based on heading level
        fontSize = element.level ? (24 - (element.level - 1) * 3) : 20;
        currentFont = boldFont;
        lineHeight = fontSize * 1.3;
        
        // Add spacing before heading
        yPosition -= lineHeight * 0.5;
      }
      
      // Word wrap the content
      const words = element.content.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > maxWidth && currentLine) {
          // Check if we need a new page
          if (yPosition < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          
          // Draw current line
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: currentFont,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      // Draw remaining text
      if (currentLine) {
        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: currentFont,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= lineHeight;
      }
      
      // Add extra spacing after heading
      if (element.type === 'heading') {
        yPosition -= lineHeight * 0.3;
      }
    }
    
    // Save PDF to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Erro na conversão Word para PDF:', error);
    throw new Error('Falha ao converter documento Word para PDF');
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validate file type - only .docx is supported by mammoth
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== '.docx') {
      return NextResponse.json({ 
        error: 'Apenas arquivos .docx são aceitos. Para arquivos .doc, salve-os como .docx primeiro.' 
      }, { status: 400 });
    }

    // Convert file to buffer (process in memory only)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert Word to PDF
    const pdfBuffer = await convertWordToPDF(buffer);
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}.pdf`;

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Word to PDF conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao converter documento Word para PDF' 
    }, { status: 500 });
  }
}
