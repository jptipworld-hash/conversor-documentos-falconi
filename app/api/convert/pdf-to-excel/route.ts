

import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

// Real PDF to Excel conversion with data extraction
async function convertPDFToExcel(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    // Extract text from PDF using pdf-parse
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Não foi possível extrair dados do PDF. O PDF pode estar vazio ou ser apenas imagens.');
    }

    // Create Excel workbook with extracted content
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Conteúdo PDF');
    
    // Try to detect if content looks like tabular data
    const lines = extractedText.split('\n').filter((line: string) => line.trim());
    
    // Check if first line could be headers (contains multiple words/items separated by spaces or tabs)
    const firstLine = lines[0];
    const isPotentialTable = firstLine && (
      firstLine.includes('\t') || 
      (firstLine.split(/\s{2,}/).length > 2)
    );

    if (isPotentialTable) {
      // Try to parse as table
      const delimiter = firstLine.includes('\t') ? '\t' : /\s{2,}/;
      
      // Process lines as table
      const rows = lines.map((line: string) => line.split(delimiter).map((cell: string) => cell.trim()));
      
      // Set headers from first row
      const headers = rows[0];
      worksheet.columns = headers.map((header: string, idx: number) => ({
        header: header || `Coluna ${idx + 1}`,
        key: `col${idx}`,
        width: 20
      }));
      
      // Add data rows
      for (let i = 1; i < rows.length; i++) {
        const rowData: any = {};
        rows[i].forEach((cell: string, idx: number) => {
          rowData[`col${idx}`] = cell;
        });
        worksheet.addRow(rowData);
      }
      
      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 11 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7A7423' }
      };
      
    } else {
      // Not a table - create a simple text extraction sheet
      worksheet.columns = [
        { header: 'Linha', key: 'lineNum', width: 10 },
        { header: 'Conteúdo', key: 'content', width: 100 }
      ];
      
      // Add each line as a row
      lines.forEach((line: string, index: number) => {
        if (line.trim()) {
          worksheet.addRow({
            lineNum: index + 1,
            content: line.trim()
          });
        }
      });
      
      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 11 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7A7423' }
      };
      
      // Alternate row colors
      for (let i = 2; i <= worksheet.rowCount; i++) {
        if (i % 2 === 0) {
          worksheet.getRow(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      }
    }
    
    // Add metadata sheet
    const metaSheet = workbook.addWorksheet('Informações');
    metaSheet.columns = [
      { header: 'Propriedade', key: 'property', width: 25 },
      { header: 'Valor', key: 'value', width: 50 }
    ];
    
    metaSheet.addRow({ property: 'Total de Páginas', value: pdfData.numpages });
    metaSheet.addRow({ property: 'Total de Linhas Extraídas', value: lines.length });
    metaSheet.addRow({ property: 'Tamanho do Arquivo', value: `${(pdfBuffer.length / 1024).toFixed(2)} KB` });
    metaSheet.addRow({ property: 'Data de Conversão', value: new Date().toLocaleString('pt-BR') });
    
    metaSheet.getRow(1).font = { bold: true };
    metaSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA7E82B' }
    };
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error in convertPDFToExcel:', error);
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
    if (fileExtension !== '.pdf') {
      return NextResponse.json({ 
        error: 'Apenas arquivos PDF são aceitos' 
      }, { status: 400 });
    }

    // Convert file to buffer (process in memory only)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert PDF to Excel
    const excelBuffer = await convertPDFToExcel(buffer);
    
    // Generate output filename
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFileName = `${baseName}.xlsx`;

    // Return Excel as response
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF to Excel conversion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
