
import { NextRequest, NextResponse } from 'next/server';
import { createZipArchive, convertPDFToImages } from '@/lib/conversion-utils';

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
    
    // Convert PDF pages to images
    const imageBuffers = await convertPDFToImages(buffer);
    
    if (imageBuffers.length === 0) {
      throw new Error('Não foi possível converter o PDF em imagens');
    }

    // Create files array for zip
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const files = imageBuffers.map((buffer, index) => ({
      name: `${baseName}_page_${index + 1}.jpg`,
      data: buffer
    }));

    // Create zip archive if multiple images, otherwise return single image
    let responseBuffer: Buffer;
    let contentType: string;
    let outputFileName: string;

    if (files.length === 1) {
      responseBuffer = files[0].data;
      contentType = 'image/jpeg';
      outputFileName = files[0].name;
    } else {
      responseBuffer = await createZipArchive(files);
      contentType = 'application/zip';
      outputFileName = `${baseName}_images.zip`;
    }

    // Return images as response
    return new NextResponse(responseBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': responseBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF to JPG conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
