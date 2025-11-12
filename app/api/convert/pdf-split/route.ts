

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

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
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(buffer);
    const totalPages = pdfDoc.getPageCount();
    
    if (totalPages < 2) {
      return NextResponse.json({ 
        error: 'O PDF deve ter pelo menos 2 páginas para ser dividido' 
      }, { status: 400 });
    }

    // Create a ZIP file with all the split PDFs
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    // Generate output filename base
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    // Split each page into a separate PDF
    for (let i = 0; i < totalPages; i++) {
      // Create a new PDF for this page
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      // Save to buffer
      const pdfBytes = await newPdf.save();
      
      // Add to ZIP
      const pageNumber = (i + 1).toString().padStart(3, '0');
      zip.file(`${baseName}_pagina_${pageNumber}.pdf`, pdfBytes);
    }
    
    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Return ZIP as response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${baseName}_dividido.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF split error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
