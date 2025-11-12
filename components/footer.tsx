
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#7A7423] text-white py-8 mt-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Conversor de Documentos Falconi</h3>
            <p className="text-gray-300">
              Convertendo documentos com segurança e eficiência
            </p>
          </div>
          
          <div className="border-t border-[#A7E82B]/30 pt-4">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} Falconi. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Arquivos são processados e deletados imediatamente após a conversão para garantir sua privacidade.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
