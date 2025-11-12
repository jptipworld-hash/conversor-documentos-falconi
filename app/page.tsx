
import Header from "@/components/header";
import ConversionGrid from "@/components/conversion-grid";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAEBE9] to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-[#7A7423] mb-4">
            Conversor de Documentos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Converta, edite e processe seus documentos de forma rápida, segura e 
            <span className="text-[#A7E82B] font-semibold"> gratuita</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              ✓ Sem registro necessário
            </span>
            <span className="flex items-center gap-1">
              ✓ Arquivos deletados após conversão
            </span>
            <span className="flex items-center gap-1">
              ✓ Processamento rápido e seguro
            </span>
          </div>
        </section>

        {/* Conversion Options */}
        <ConversionGrid />
        
        {/* Features Section */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[#7A7423] mb-8">
            Por que escolher nosso conversor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
              <div className="w-12 h-12 bg-[#61C2FF] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#7A7423] mb-2">Seguro</h3>
              <p className="text-gray-600">
                Seus arquivos são automaticamente deletados após a conversão, garantindo total privacidade
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
              <div className="w-12 h-12 bg-[#FF7628] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#7A7423] mb-2">Rápido</h3>
              <p className="text-gray-600">
                Conversões otimizadas com processamento em alta velocidade no servidor
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
              <div className="w-12 h-12 bg-[#D9B300] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#7A7423] mb-2">Gratuito</h3>
              <p className="text-gray-600">
                Todos os recursos disponíveis sem custo, sem limitações ou registros necessários
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
