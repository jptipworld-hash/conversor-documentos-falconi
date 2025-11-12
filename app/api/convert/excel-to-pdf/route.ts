

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import ExcelJS from 'exceljs';

// Function for Excel to PDF conversion
async function convertExcelToPDF(excelBuffer: Buffer): Promise<Buffer> {
  try {
    // Load Excel workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const fontSize = 10;
    const titleFontSize = 14;
    const margin = 40;
    const lineHeight = fontSize * 1.5;
    
    // Process each worksheet
    workbook.eachSheet((worksheet, sheetId) => {
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      let yPosition = height - margin;
      
      // Add sheet name as title
      const titleText = worksheet.name || `Planilha ${sheetId}`;
      page.drawText(titleText, {
        x: margin,
        y: yPosition,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0.48, 0.45, 0.14), // #7A7423
      });
      
      yPosition -= titleFontSize * 2;
      
      // Process rows
      worksheet.eachRow((row, rowNumber) => {
        const rowValues = row.values as any[];
        const rowText = rowValues
          .slice(1) // Skip first element (it's undefined in exceljs)
          .map(cell => cell !== null && cell !== undefined ? String(cell) : '')
          .join('  |  ');
        
        if (rowText.trim()) {
          // Check if text fits in one line
          const textWidth = font.widthOfTextAtSize(rowText, fontSize);
          
          if (textWidth > width - 2 * margin) {
            // Wrap text
            const chunks = rowText.match(/.{1,80}/g) || [rowText];
            for (const chunk of chunks) {
              page.drawText(chunk, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              
              yPosition -= lineHeight;
              
              if (yPosition < margin) {
                page = pdfDoc.addPage();
                yPosition = height - margin;
              }
            }
          } else {
            page.drawText(rowText, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            
            yPosition -= lineHeight;
            
            if (yPosition < margin) {
              page = pdfDoc.addPage();
              yPosition = height - margin;
            }
          }
        }
      });
    });

    // Save PDF to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
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
    if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
      return NextResponse.json({ 
        error: 'Apenas arquivos Excel (.xls, .xlsx) são aceitos' 
      }, { status: 400 });
    }

    // Convert file to buffer (process in memory only)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert Excel to PDF
    const pdfBuffer = await convertExcelToPDF(buffer);
    
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
    console.error('Excel to PDF conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
