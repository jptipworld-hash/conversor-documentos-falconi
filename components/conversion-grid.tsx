
import ConversionCard from "./conversion-card";

const conversionOptions = [
  {
    id: "pdf-merge",
    title: "Juntar PDF",
    description: "Combine múltiplos arquivos PDF em um único documento",
    iconName: "files" as const,
    color: "#61C2FF",
    acceptedFiles: ".pdf",
    endpoint: "/api/convert/pdf-merge"
  },
  {
    id: "pdf-split",
    title: "Dividir PDF",
    description: "Separe páginas de PDF em arquivos individuais",
    iconName: "scissors" as const,
    color: "#FF7628",
    acceptedFiles: ".pdf",
    endpoint: "/api/convert/pdf-split"
  },
  {
    id: "word-to-pdf",
    title: "Word para PDF",
    description: "Converta documentos DOCX para PDF",
    iconName: "file-text" as const,
    color: "#61C2FF",
    acceptedFiles: ".docx,.doc",
    endpoint: "/api/convert/word-to-pdf"
  },
  {
    id: "pdf-to-word",
    title: "PDF para Word",
    description: "Converta PDF para documento editável DOCX",
    iconName: "download" as const,
    color: "#FF7628",
    acceptedFiles: ".pdf",
    endpoint: "/api/convert/pdf-to-word"
  },
  {
    id: "excel-to-pdf",
    title: "Excel para PDF",
    description: "Converta planilhas XLSX para PDF",
    iconName: "spreadsheet" as const,
    color: "#D9B300",
    acceptedFiles: ".xlsx,.xls",
    endpoint: "/api/convert/excel-to-pdf"
  },
  {
    id: "pdf-to-excel",
    title: "PDF para Excel",
    description: "Extraia tabelas do PDF para planilha XLSX",
    iconName: "spreadsheet" as const,
    color: "#A7E82B",
    acceptedFiles: ".pdf",
    endpoint: "/api/convert/pdf-to-excel"
  },
  {
    id: "ppt-to-pdf",
    title: "PowerPoint para PDF",
    description: "Converta apresentações PPTX para PDF",
    iconName: "presentation" as const,
    color: "#D64550",
    acceptedFiles: ".pptx,.ppt",
    endpoint: "/api/convert/ppt-to-pdf"
  },
  {
    id: "txt-csv-convert",
    title: "TXT ↔ CSV",
    description: "Converta entre formatos de texto e CSV",
    iconName: "file-type" as const,
    color: "#7A7423",
    acceptedFiles: ".txt,.csv",
    endpoint: "/api/convert/txt-csv"
  }
];

export default function ConversionGrid() {
  return (
    <section id="conversores" className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#7A7423] mb-4">
          Escolha o tipo de conversão
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecione a funcionalidade desejada e faça upload dos seus arquivos. 
          O processo é rápido, seguro e seus arquivos são automaticamente removidos após a conversão.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {conversionOptions.map((option) => (
          <ConversionCard
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description}
            iconName={option.iconName}
            color={option.color}
            acceptedFiles={option.acceptedFiles}
            endpoint={option.endpoint}
          />
        ))}
      </div>
    </section>
  );
}
