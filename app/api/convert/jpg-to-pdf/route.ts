

import { NextRequest, NextResponse } from 'next/server';
import { createPDFFromImages, optimizeImage } from '@/lib/conversion-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !['.jpg', '.jpeg', '.png'].includes(fileExtension);
    });
    
    if (invalidFiles.length > 0) {
      return NextResponse.json({ 
        error: `Tipos de arquivo inválidos: ${invalidFiles.map(f => f.name).join(', ')}. Apenas JPG, JPEG e PNG são aceitos.` 
      }, { status: 400 });
    }

    // Process all images in memory
    const imageBuffers: Buffer[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const optimizedBuffer = await optimizeImage(buffer);
      imageBuffers.push(optimizedBuffer);
    }

    // Create PDF from images
    const pdfBuffer = await createPDFFromImages(imageBuffers);
    
    // Generate output filename
    const baseName = files[0].name.substring(0, files[0].name.lastIndexOf('.')) || files[0].name;
    const outputFileName = files.length === 1 
      ? `${baseName}.pdf`
      : 'images_combined.pdf';

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('JPG to PDF conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
