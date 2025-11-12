

import { NextRequest, NextResponse } from 'next/server';
import { convertCSVToTXT, convertTXTToCSV } from '@/lib/conversion-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== '.txt' && fileExtension !== '.csv') {
      return NextResponse.json({ 
        error: 'Apenas arquivos TXT e CSV são aceitos' 
      }, { status: 400 });
    }

    // Read file content
    const content = await file.text();
    
    let convertedContent: string;
    let outputExtension: string;
    let contentType: string;

    if (fileExtension === '.csv') {
      // Convert CSV to TXT
      convertedContent = await convertCSVToTXT(content);
      outputExtension = '.txt';
      contentType = 'text/plain';
    } else {
      // Convert TXT to CSV
      convertedContent = await convertTXTToCSV(content);
      outputExtension = '.csv';
      contentType = 'text/csv';
    }
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}${outputExtension}`;

    // Return converted content as response
    const buffer = Buffer.from(convertedContent, 'utf-8');
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('TXT/CSV conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
