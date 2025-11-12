
import { NextRequest, NextResponse } from 'next/server';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

// Real PDF to Word conversion with text extraction
async function convertPDFToWord(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    // Extract text from PDF using pdf-parse
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do PDF. O PDF pode estar vazio ou ser apenas imagens.');
    }

    // Split text into paragraphs
    const paragraphs = extractedText.split(/\n\n+/);
    
    // Create Word document with extracted content
    const documentChildren: Paragraph[] = [];
    
    paragraphs.forEach((para: string) => {
      const trimmedPara = para.trim();
      if (!trimmedPara) return;

      // Check if paragraph looks like a heading (short and uppercase or starts with number)
      const isHeading = (
        trimmedPara.length < 60 && 
        (trimmedPara === trimmedPara.toUpperCase() || /^\d+\.?\s/.test(trimmedPara))
      );

      if (isHeading) {
        documentChildren.push(
          new Paragraph({
            text: trimmedPara,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          })
        );
      } else {
        // Split long paragraphs into lines
        const lines = trimmedPara.split(/\n/);
        lines.forEach((line: string) => {
          if (line.trim()) {
            documentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.trim(),
                    size: 24, // 12pt
                  })
                ],
                spacing: { after: 120 }
              })
            );
          }
        });
      }
    });

    // Create document with metadata
    const doc = new Document({
      sections: [{
        properties: {},
        children: documentChildren
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error in convertPDFToWord:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== '.pdf') {
      return NextResponse.json({ 
        error: 'Apenas arquivos PDF são aceitos' 
      }, { status: 400 });
    }

    // Convert file to buffer (process in memory only)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert PDF to Word
    const docxBuffer = await convertPDFToWord(buffer);
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}.docx`;

    // Return DOCX as response
    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': docxBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF to Word conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
