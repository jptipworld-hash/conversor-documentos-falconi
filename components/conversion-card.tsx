
"use client";

import { useState } from "react";
import {
  FileText,
  FileImage,
  Files,
  Scissors,
  Archive,
  Edit,
  FileType2,
  FileSpreadsheet,
  Presentation,
  Download,
  Upload
} from "lucide-react";
import FileUpload from "./file-upload";
import Modal from "./modal";
import PDFEditModal from "./pdf-edit-modal";

const iconMap = {
  "files": Files,
  "scissors": Scissors,
  "archive": Archive,
  "edit": Edit,
  "image": FileImage,
  "upload": Upload,
  "file-text": FileText,
  "download": Download,
  "spreadsheet": FileSpreadsheet,
  "presentation": Presentation,
  "file-type": FileType2
};

interface ConversionCardProps {
  id: string;
  title: string;
  description: string;
  iconName: keyof typeof iconMap;
  color: string;
  acceptedFiles: string;
  endpoint: string;
}

export default function ConversionCard({
  id,
  title,
  description,
  iconName,
  color,
  acceptedFiles,
  endpoint
}: ConversionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const Icon = iconMap[iconName];

  // Use special modal for PDF editing
  if (id === "pdf-edit") {
    return (
      <>
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 hover-lift cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="p-6">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-[#7A7423] mb-2 group-hover:text-[#A7E82B] transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>

            {/* Supported formats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                Formatos: {acceptedFiles.replace(/\./g, "").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Special PDF Edit Modal */}
        <PDFEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-lg border border-gray-200 hover-lift cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="p-6">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-[#7A7423] mb-2 group-hover:text-[#A7E82B] transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>

          {/* Supported formats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">
              Formatos: {acceptedFiles.replace(/\./g, "").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">{description}</p>
        </div>
        <FileUpload
          acceptedFiles={acceptedFiles}
          endpoint={endpoint}
          conversionType={id}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
