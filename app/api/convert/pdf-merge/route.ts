
import { NextRequest, NextResponse } from 'next/server';
import { mergePDFs } from '@/lib/conversion-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length < 2) {
      return NextResponse.json({ 
        error: 'Pelo menos 2 arquivos PDF são necessários para juntar' 
      }, { status: 400 });
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return fileExtension !== '.pdf';
    });
    
    if (invalidFiles.length > 0) {
      return NextResponse.json({ 
        error: `Tipos de arquivo inválidos: ${invalidFiles.map(f => f.name).join(', ')}. Apenas PDF é aceito.` 
      }, { status: 400 });
    }

    // Convert all files to buffers (process in memory only)
    const pdfBuffers: Buffer[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      pdfBuffers.push(buffer);
    }

    // Merge PDFs
    const mergedPdfBuffer = await mergePDFs(pdfBuffers);
    
    // Generate output filename
    const outputFileName = 'merged_document.pdf';

    // Return merged PDF as response
    return new NextResponse(mergedPdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': mergedPdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF merge error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
