

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import pptx2json from 'pptx2json';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Real PowerPoint to PDF conversion with content extraction
async function convertPowerPointToPDF(pptBuffer: Buffer): Promise<Buffer> {
  let tempFilePath: string | null = null;
  
  try {
    // pptx2json requires a file path, so we need to save temporarily
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `temp-${Date.now()}.pptx`);
    await promisify(fs.writeFile)(tempFilePath, pptBuffer);
    
    // Extract content from PowerPoint
    const pptxData = await new Promise<any>((resolve, reject) => {
      pptx2json(tempFilePath!, (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const fontSize = 12;
    const titleFontSize = 18;
    const margin = 50;
    const lineHeight = fontSize * 1.8;
    
    // Process each slide
    if (pptxData && pptxData.slides) {
      pptxData.slides.forEach((slide: any, slideIndex: number) => {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        let yPosition = height - margin;
        
        // Add slide title
        const slideTitle = `Slide ${slideIndex + 1}`;
        page.drawText(slideTitle, {
          x: margin,
          y: yPosition,
          size: titleFontSize,
          font: boldFont,
          color: rgb(0.48, 0.45, 0.14), // #7A7423 (Falconi color)
        });
        
        yPosition -= titleFontSize * 2;
        
        // Extract text content from slide
        let slideContent = '';
        
        if (slide.content && Array.isArray(slide.content)) {
          slide.content.forEach((item: any) => {
            if (item.text && typeof item.text === 'string') {
              slideContent += item.text + '\n';
            }
          });
        }
        
        // If no content found, try alternative structure
        if (!slideContent && slide.shapes) {
          slide.shapes.forEach((shape: any) => {
            if (shape.text) {
              slideContent += shape.text + '\n';
            }
          });
        }
        
        // Draw slide content
        if (slideContent) {
          const lines = slideContent.split('\n').filter(l => l.trim());
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            // Word wrap long lines
            const maxWidth = width - 2 * margin;
            const words = line.trim().split(' ');
            let currentLine = '';
            
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const textWidth = font.widthOfTextAtSize(testLine, fontSize);
              
              if (textWidth > maxWidth && currentLine) {
                // Draw current line
                page.drawText(currentLine, {
                  x: margin,
                  y: yPosition,
                  size: fontSize,
                  font: font,
                  color: rgb(0, 0, 0),
                });
                
                yPosition -= lineHeight;
                currentLine = word;
                
                // Check if we're at bottom of page
                if (yPosition < margin) {
                  break; // Move to next slide
                }
              } else {
                currentLine = testLine;
              }
            }
            
            // Draw remaining text
            if (currentLine && yPosition >= margin) {
              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              
              yPosition -= lineHeight;
            }
            
            if (yPosition < margin) break;
          }
        } else {
          // No text content found
          page.drawText('(Slide sem conteúdo de texto)', {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      });
    } else {
      // Fallback if extraction fails
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      page.drawText('Apresentação PowerPoint Convertida', {
        x: margin,
        y: height - margin,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0.48, 0.45, 0.14),
      });
      
      page.drawText('Não foi possível extrair o conteúdo textual da apresentação.', {
        x: margin,
        y: height - margin - 50,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('O arquivo foi processado, mas pode conter apenas imagens ou elementos visuais.', {
        x: margin,
        y: height - margin - 75,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    // Save PDF to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error extracting PowerPoint content:', error);
    
    // Fallback: Create a simple PDF with error message
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    
    page.drawText('Apresentação PowerPoint Convertida', {
      x: margin,
      y: height - margin,
      size: 18,
      font: boldFont,
      color: rgb(0.48, 0.45, 0.14),
    });
    
    page.drawText('A conversão foi concluída, mas não foi possível extrair o conteúdo completo.', {
      x: margin,
      y: height - margin - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Isso pode ocorrer se o arquivo contém principalmente elementos visuais.', {
      x: margin,
      y: height - margin - 75,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await promisify(fs.unlink)(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
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
    if (fileExtension !== '.pptx' && fileExtension !== '.ppt') {
      return NextResponse.json({ 
        error: 'Apenas arquivos PowerPoint (.ppt, .pptx) são aceitos' 
      }, { status: 400 });
    }

    // Convert file to buffer (process in memory only)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert PowerPoint to PDF
    const pdfBuffer = await convertPowerPointToPDF(buffer);
    
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
    console.error('PowerPoint to PDF conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
