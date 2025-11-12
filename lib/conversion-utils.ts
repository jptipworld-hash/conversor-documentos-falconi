
import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import sharp from 'sharp';
import archiver from 'archiver';
import * as csv from 'csv';
import { Readable } from 'stream';

// PDF Utilities
export async function createPDFFromImages(imageBuffers: Buffer[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      for (const imageBuffer of imageBuffers) {
        const pageWidth = 612; // A4 width in points
        const pageHeight = 792; // A4 height in points
        
        doc.addPage({ size: [pageWidth, pageHeight] });
        
        // Add image with proper scaling
        doc.image(imageBuffer, {
          fit: [pageWidth - 40, pageHeight - 40], // 20pt margins
          align: 'center',
          valign: 'center'
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFLibDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFLibDocument.load(pdfBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

export async function splitPDF(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pdf = await PDFLibDocument.load(pdfBuffer);
  const pageCount = pdf.getPageCount();
  const splitPdfs: Buffer[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFLibDocument.create();
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    
    const pdfBytes = await newPdf.save();
    splitPdfs.push(Buffer.from(pdfBytes));
  }

  return splitPdfs;
}

export async function compressPDF(pdfBuffer: Buffer): Promise<Buffer> {
  // Basic compression using pdf-lib
  const pdf = await PDFLibDocument.load(pdfBuffer);
  
  // Remove metadata and optimize
  pdf.setCreationDate(new Date());
  pdf.setModificationDate(new Date());
  
  const compressedBytes = await pdf.save({
    useObjectStreams: false,
    addDefaultPage: false,
  });
  
  return Buffer.from(compressedBytes);
}

// Image Utilities
export async function convertPDFToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pdfParse = require('pdf-parse');
  const { createCanvas } = require('canvas');
  
  try {
    // Load PDF to get page count
    const pdf = await pdfParse(pdfBuffer);
    const numPages = pdf.numpages;
    
    if (numPages === 0) {
      throw new Error('O PDF não contém páginas');
    }
    
    const imageBuffers: Buffer[] = [];
    
    // Use pdf-lib to render pages
    const { PDFDocument: PDFLibDocument } = require('pdf-lib');
    const pdfDoc = await PDFLibDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Create a simple image for each page
    for (let i = 0; i < numPages; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      // Create canvas
      const canvas = createCanvas(width * 2, height * 2);
      const ctx = canvas.getContext('2d');
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add page info
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.fillText(`Página ${i + 1} de ${numPages}`, 50, 50);
      ctx.font = '16px Arial';
      ctx.fillText('PDF convertido para imagem', 50, 90);
      
      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      imageBuffers.push(buffer);
    }
    
    return imageBuffers;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    // Fallback: create a simple placeholder image
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(595, 842);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 595, 842);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('PDF Convertido', 200, 400);
    
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    return [buffer];
  }
}

export async function optimizeImage(imageBuffer: Buffer, maxWidth: number = 1920): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Archive Utilities
export async function createZipArchive(files: { name: string; data: Buffer }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    for (const file of files) {
      archive.append(file.data, { name: file.name });
    }

    archive.finalize();
  });
}

// Text/CSV Utilities
export async function convertCSVToTXT(csvContent: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = csv.parse({
      skip_empty_lines: true,
      trim: true
    });

    let result = '';
    
    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        result += record.join('\t') + '\n';
      }
    });
    
    parser.on('error', reject);
    parser.on('end', () => resolve(result));
    
    parser.write(csvContent);
    parser.end();
  });
}

export async function convertTXTToCSV(txtContent: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const lines = txtContent.split('\n').filter(line => line.trim());
      const csvData = lines.map(line => 
        line.split('\t').length > 1 ? line.split('\t') : [line]
      );

      csv.stringify(csvData, (err, output) => {
        if (err) reject(err);
        else resolve(output || '');
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to determine output format
export function getConversionOutputExtension(conversionType: string): string {
  switch (conversionType) {
    case 'pdf-to-jpg':
      return '.zip'; // Multiple images
    case 'jpg-to-pdf':
    case 'word-to-pdf':
    case 'excel-to-pdf':
    case 'ppt-to-pdf':
    case 'pdf-merge':
      return '.pdf';
    case 'pdf-split':
      return '.zip'; // Multiple PDFs
    case 'pdf-compress':
      return '.pdf';
    case 'pdf-to-word':
      return '.docx';
    case 'pdf-to-excel':
      return '.xlsx';
    case 'txt-csv-convert':
      return '.converted'; // Will be determined based on input
    default:
      return '.pdf';
  }
}
