
"use client";

import { useState } from "react";
import { Type, Square, Circle, Download, Palette, Move } from "lucide-react";

interface PDFEditorProps {
  onEdit: (editData: any) => void;
}

export default function PDFEditor({ onEdit }: PDFEditorProps) {
  const [editType, setEditType] = useState<"text" | "rectangle" | "circle">("text");
  const [text, setText] = useState("");
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState("#000000");

  const handleSubmit = () => {
    const editData = {
      editType,
      text: editType === "text" ? text : undefined,
      x: position.x,
      y: position.y,
      fontSize,
      color
    };
    
    onEdit(editData);
  };

  const presetColors = [
    "#000000", "#7A7423", "#A7E82B", "#FF7628", 
    "#61C2FF", "#D9B300", "#D64550", "#FFFFFF"
  ];

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#7A7423] mb-3">Ferramenta de Edição</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEditType("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              editType === "text" 
                ? "bg-[#7A7423] text-white border-[#7A7423]" 
                : "bg-white text-gray-700 border-gray-300 hover:border-[#7A7423]"
            }`}
          >
            <Type className="w-4 h-4" />
            Texto
          </button>
          <button
            onClick={() => setEditType("rectangle")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              editType === "rectangle" 
                ? "bg-[#7A7423] text-white border-[#7A7423]" 
                : "bg-white text-gray-700 border-gray-300 hover:border-[#7A7423]"
            }`}
          >
            <Square className="w-4 h-4" />
            Retângulo
          </button>
          <button
            onClick={() => setEditType("circle")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              editType === "circle" 
                ? "bg-[#7A7423] text-white border-[#7A7423]" 
                : "bg-white text-gray-700 border-gray-300 hover:border-[#7A7423]"
            }`}
          >
            <Circle className="w-4 h-4" />
            Círculo
          </button>
        </div>
      </div>

      {/* Text Input (only for text tool) */}
      {editType === "text" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#7A7423] mb-3">Texto a Adicionar</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o texto que será adicionado ao PDF..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7A7423] focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Position Controls */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#7A7423] mb-3 flex items-center gap-2">
          <Move className="w-5 h-5" />
          Posição
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X (horizontal)
            </label>
            <input
              type="number"
              value={position.x}
              onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7A7423] focus:border-transparent"
              min="0"
              max="600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y (vertical)
            </label>
            <input
              type="number"
              value={position.y}
              onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7A7423] focus:border-transparent"
              min="0"
              max="800"
            />
          </div>
        </div>
      </div>

      {/* Font Size (only for text) */}
      {editType === "text" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#7A7423] mb-3">Tamanho da Fonte</h3>
          <input
            type="range"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            min="8"
            max="48"
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>8px</span>
            <span className="font-medium">{fontSize}px</span>
            <span>48px</span>
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#7A7423] mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Cor
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => setColor(presetColor)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color === presetColor ? "border-gray-400" : "border-gray-300"
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">{color.toUpperCase()}</span>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#7A7423] mb-3">Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] relative border-2 border-dashed border-gray-300">
          <div 
            className="absolute"
            style={{
              left: `${Math.min(position.x, 90)}%`,
              top: `${Math.min(position.y / 8, 90)}%`,
              color: color
            }}
          >
            {editType === "text" && text && (
              <span style={{ fontSize: `${fontSize}px` }}>{text}</span>
            )}
            {editType === "rectangle" && (
              <div 
                style={{ 
                  width: "40px", 
                  height: "20px", 
                  border: `2px solid ${color}`,
                  backgroundColor: "transparent"
                }}
              />
            )}
            {editType === "circle" && (
              <div 
                style={{ 
                  width: "30px", 
                  height: "30px", 
                  border: `2px solid ${color}`,
                  borderRadius: "50%",
                  backgroundColor: "transparent"
                }}
              />
            )}
          </div>
          {!text && editType === "text" && (
            <div className="text-gray-400 text-center py-8">
              Digite um texto para ver a prévia
            </div>
          )}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleSubmit}
        disabled={editType === "text" && !text.trim()}
        className="w-full bg-[#7A7423] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#A7E82B] hover:text-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Aplicar Edição e Download
      </button>
    </div>
  );
}
