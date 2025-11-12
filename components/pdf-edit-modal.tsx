
"use client";

import { useState } from "react";
import Modal from "./modal";
import PDFEditor from "./pdf-editor";
import FileUpload from "./file-upload";
import { toast } from "sonner";

interface PDFEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFEditModal({ isOpen, onClose }: PDFEditModalProps) {
  const [step, setStep] = useState<"upload" | "edit">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
    setStep("edit");
  };

  const handleEditSubmit = async (editData: any) => {
    if (!uploadedFile) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('editType', editData.editType);
      formData.append('x', editData.x.toString());
      formData.append('y', editData.y.toString());
      formData.append('fontSize', editData.fontSize.toString());
      formData.append('color', editData.color);
      
      if (editData.text) {
        formData.append('text', editData.text);
      }

      const response = await fetch('/api/convert/pdf-edit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na edição');
      }

      // Download the edited PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${uploadedFile.name.replace('.pdf', '')}_edited.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('PDF editado com sucesso!');
      setStep("upload");
      setUploadedFile(null);
      onClose();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleBack = () => {
    setStep("upload");
    setUploadedFile(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar PDF"
    >
      {step === "upload" ? (
        <div>
          <p className="text-gray-600 mb-4">
            Faça upload do arquivo PDF que deseja editar. Você poderá adicionar texto, formas e anotações.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUploaded(file);
                }
              }}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-[#7A7423] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Clique para selecionar arquivo PDF
              </h3>
              <p className="text-sm text-gray-500">
                Apenas arquivos PDF são aceitos
              </p>
            </label>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Editando: {uploadedFile?.name}
              </h3>
              <p className="text-sm text-gray-500">
                Configure as opções abaixo e clique em "Aplicar Edição"
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-3 py-1 text-sm text-[#7A7423] hover:bg-[#7A7423]/10 rounded transition-colors"
            >
              ← Voltar
            </button>
          </div>
          
          <PDFEditor onEdit={handleEditSubmit} />
        </div>
      )}
    </Modal>
  );
}
