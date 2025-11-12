

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const editType = formData.get('editType') as string;
    const text = formData.get('text') as string;
    const x = parseFloat(formData.get('x') as string || '50');
    const y = parseFloat(formData.get('y') as string || '50');
    const fontSize = parseFloat(formData.get('fontSize') as string || '12');
    const color = formData.get('color') as string || '#000000';
    
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
    
    // Load PDF document
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    
    if (pages.length === 0) {
      throw new Error('PDF não contém páginas válidas');
    }

    // Get the first page (for simplicity)
    const firstPage = pages[0];
    
    // Parse color
    const hexColor = color.startsWith('#') ? color.slice(1) : color;
    const r = parseInt(hexColor.substr(0, 2), 16) / 255;
    const g = parseInt(hexColor.substr(2, 2), 16) / 255;
    const b = parseInt(hexColor.substr(4, 2), 16) / 255;

    switch (editType) {
      case 'text':
        if (!text) {
          throw new Error('Texto é obrigatório para adição de texto');
        }
        
        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        // Add text to the first page
        firstPage.drawText(text, {
          x: x,
          y: firstPage.getHeight() - y, // PDF coordinates are bottom-up
          size: fontSize,
          font: font,
          color: rgb(r, g, b),
        });
        break;
        
      case 'rectangle':
        // Add a rectangle
        firstPage.drawRectangle({
          x: x,
          y: firstPage.getHeight() - y - 50,
          width: 100,
          height: 50,
          borderColor: rgb(r, g, b),
          borderWidth: 2,
        });
        break;
        
      case 'circle':
        // Add a circle (ellipse with equal width and height)
        firstPage.drawEllipse({
          x: x + 25,
          y: firstPage.getHeight() - y - 25,
          xScale: 25,
          yScale: 25,
          borderColor: rgb(r, g, b),
          borderWidth: 2,
        });
        break;
        
      default:
        throw new Error('Tipo de edição não suportado');
    }
    
    // Save the modified PDF
    const editedPdfBytes = await pdfDoc.save();
    const editedPdfBuffer = Buffer.from(editedPdfBytes);
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}_edited.pdf`;

    // Return edited PDF as response
    return new NextResponse(editedPdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': editedPdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF edit error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
