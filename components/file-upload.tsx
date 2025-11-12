
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, File, X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  acceptedFiles: string;
  endpoint: string;
  conversionType: string;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  downloadUrl?: string;
  error?: string;
}

export default function FileUpload({ 
  acceptedFiles, 
  endpoint, 
  conversionType,
  onClose 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return acceptedFiles.includes(fileExtension);
    });

    if (validFiles.length !== newFiles.length) {
      toast.error("Alguns arquivos foram rejeitados. Verifique os formatos aceitos.");
    }

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: generateId(),
      progress: 0,
      status: "uploading" as const
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);

    // For batch conversions (merge, split), upload all files together
    // Otherwise upload individually
    if (conversionType === 'pdf-merge' || conversionType === 'pdf-split') {
      uploadBatch(uploadedFiles);
    } else {
      // Start upload for each file individually
      uploadedFiles.forEach(uploadFile);
    }
  };

  const uploadBatch = async (uploadedFiles: UploadedFile[]) => {
    try {
      const formData = new FormData();
      
      // Add all files to form data
      uploadedFiles.forEach(uploadedFile => {
        formData.append('file', uploadedFile.file);
      });
      formData.append('conversionType', conversionType);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Erro na conversão: ${response.statusText}`);
      }

      // Check if response is a file (for direct downloads)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/')) {
        // File download
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        // Mark all files as completed
        setFiles(prev => prev.map(f => 
          uploadedFiles.find(uf => uf.id === f.id)
            ? { ...f, status: "completed", progress: 100, downloadUrl }
            : f
        ));

        // Auto download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = conversionType === 'pdf-merge' ? 'merged_document.pdf' : 'split_pages.zip';
        link.click();

        toast.success(`Conversão concluída com sucesso!`);
      } else {
        // JSON response with download URL
        const result = await response.json();
        
        setFiles(prev => prev.map(f => 
          uploadedFiles.find(uf => uf.id === f.id)
            ? { ...f, status: "completed", progress: 100, downloadUrl: result.downloadUrl }
            : f
        ));

        toast.success(`Conversão concluída com sucesso!`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Mark all files as error
      setFiles(prev => prev.map(f => 
        uploadedFiles.find(uf => uf.id === f.id)
          ? { ...f, status: "error", error: errorMessage }
          : f
      ));

      toast.error(`Erro na conversão: ${errorMessage}`);
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('conversionType', conversionType);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Erro na conversão: ${response.statusText}`);
      }

      // Check if response is a file (for direct downloads)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/')) {
        // File download
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: "completed", progress: 100, downloadUrl }
            : f
        ));

        // Auto download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = getOutputFileName(uploadedFile.file.name, conversionType);
        link.click();

        toast.success(`${uploadedFile.file.name} convertido com sucesso!`);
      } else {
        // JSON response with download URL
        const result = await response.json();
        
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: "completed", progress: 100, downloadUrl: result.downloadUrl }
            : f
        ));

        toast.success(`${uploadedFile.file.name} convertido com sucesso!`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: "error", error: errorMessage }
          : f
      ));

      toast.error(`Erro ao converter ${uploadedFile.file.name}: ${errorMessage}`);
    }
  };

  const getOutputFileName = (originalName: string, conversionType: string): string => {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    
    switch (conversionType) {
      case 'pdf-to-jpg':
        return `${nameWithoutExt}.zip`; // Multiple images in zip
      case 'jpg-to-pdf':
      case 'word-to-pdf':
      case 'excel-to-pdf':
      case 'ppt-to-pdf':
        return `${nameWithoutExt}.pdf`;
      case 'pdf-to-word':
        return `${nameWithoutExt}.docx`;
      case 'pdf-to-excel':
        return `${nameWithoutExt}.xlsx`;
      case 'txt-csv-convert':
        return originalName.endsWith('.txt') ? `${nameWithoutExt}.csv` : `${nameWithoutExt}.txt`;
      default:
        return `${nameWithoutExt}_converted.pdf`;
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadFile = (downloadUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-[#A7E82B] bg-[#A7E82B]/10' 
            : 'border-gray-300 hover:border-[#7A7423]'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-[#A7E82B]' : 'text-gray-400'}`} />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Formatos aceitos: {acceptedFiles.replace(/\./g, '').toUpperCase()}
        </p>
        <button
          type="button"
          className="bg-[#7A7423] text-white px-6 py-2 rounded-lg hover:bg-[#A7E82B] hover:text-black transition-colors font-medium"
        >
          Selecionar Arquivos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFiles}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-[#7A7423] mb-4">
            Arquivos ({files.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <File className="w-8 h-8 text-[#7A7423] flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {/* Status */}
                  <div className="mt-1">
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#7A7423]" />
                        <span className="text-xs text-[#7A7423]">Processando...</span>
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">✓ Convertido</span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-xs text-red-600">{file.error}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.status === 'completed' && file.downloadUrl && (
                    <button
                      onClick={() => downloadFile(
                        file.downloadUrl!, 
                        getOutputFileName(file.file.name, conversionType)
                      )}
                      className="p-2 bg-[#61C2FF] text-white rounded-lg hover:bg-[#61C2FF]/80 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Fechar
        </button>
        {files.some(f => f.status === 'completed') && (
          <button
            onClick={() => {
              setFiles([]);
              onClose();
            }}
            className="px-4 py-2 bg-[#A7E82B] text-black rounded-lg hover:bg-[#A7E82B]/80 transition-colors font-medium"
          >
            Nova Conversão
          </button>
        )}
      </div>
    </div>
  );
}
