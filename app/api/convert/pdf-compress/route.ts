

import { NextRequest, NextResponse } from 'next/server';
import { compressPDF } from '@/lib/conversion-utils';

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
    
    // Compress PDF
    const compressedPdfBuffer = await compressPDF(buffer);
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}_compressed.pdf`;

    // Return compressed PDF as response
    return new NextResponse(compressedPdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': compressedPdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF compress error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
