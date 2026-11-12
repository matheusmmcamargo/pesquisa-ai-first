import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import DeckView from "./pages/DeckView";
import Privacidade from "./pages/Privacidade";
import { AssessmentForm } from "./components/AssessmentForm";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const DiagnosticPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative">
      {/* Cabeçalho Blindado contra Sobreposição */}
      <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        {/* Lado Esquerdo: Logo Oficial AC */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/agencia-camargo-logo-white.png"
              alt="Agência Camargo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                AGÊNCIA CAMARGO
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase">
                Diagnóstico gratuito
              </span>
            </div>
          </Link>
          <div className="h-4 w-px bg-[#2A2A2A] hidden sm:block"></div>
          <span className="text-[#D4AF37] text-xs font-medium tracking-widest uppercase hidden md:inline-block font-mono">
            Diagnóstico gratuito
          </span>
        </div>

        {/* Lado Direito: Botões de Navegação */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white flex items-center gap-2 text-xs sm:text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </Link>
          <div className="flex items-center gap-2 border border-[#2A2A2A] rounded-full px-3.5 sm:px-4 py-1.5 text-xs text-gray-400 bg-[#121212]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
            <span className="hidden sm:inline">Diagnóstico gratuito</span>
            <span className="sm:hidden">Diagnóstico</span>
          </div>
        </div>
      </header>

      {/* Container Principal do Formulário Blindado e Centralizado */}
      <main id="formulario-diagnostico" className="flex-grow flex flex-col items-center pt-10 sm:pt-12 pb-24 px-4 overflow-y-auto relative z-10">
        <div className="w-full max-w-4xl">
          <AssessmentForm />

          {/* Selos de Confiança e Metodologia */}
          <div className="mt-8 pt-6 border-t border-[#2A2A2A] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#A8A29E]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <Link to="/privacidade" className="hover:underline">Seus dados protegidos (LGPD)</Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Estimativa em reais, sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Resultado na hora, direto na tela</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Executivo com Logo Oficial */}
      <footer className="w-full border-t border-[#2E2E34]/80 bg-[#0B0C0D] py-8 text-center text-xs text-[#71717A] mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#A8A29E] font-mono">
            <img
              src="/agencia-camargo-logo-white.png"
              alt="Agência Camargo"
              className="h-6 w-auto object-contain"
            />
            <span>AGÊNCIA CAMARGO • CRESCIMENTO COM IA</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-[#A8A29E]">
            <Link to="/pesquisa" className="text-[#B08A61] hover:underline">
              Diagnóstico gratuito
            </Link>
            <Link to="/privacidade" className="hover:underline">Privacidade & LGPD</Link>
          </div>

          <p className="text-[11px] text-[#A8A29E]">
            © {new Date().getFullYear()} Agência Camargo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/pesquisa">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pesquisa" element={<DiagnosticPage />} />
        <Route path="/assessment" element={<DiagnosticPage />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/deck/:id" element={<DeckView />} />
        <Route path="/deck/:slug/:id" element={<DeckView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
