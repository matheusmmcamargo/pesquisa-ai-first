import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, TrendingUp, Briefcase, DollarSign, AlertCircle, Factory, Store, Layers, Database, Clock, Target, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { track } from "../lib/track";

export interface EconomicDataState {
  leadsMensais: string; // ex: "150" ou "nao_sei"
  taxaConversao: string; // ex: "5" ou "nao_sei"
  ticketMedio: string; // ex: "2500" ou "nao_sei"
  tempoResposta: string; // ex: "menos_15m", "15m_1h", "mais_1h", "nao_sei"
  horasManuais: string; // ex: "40" ou "nao_sei"
  margemContribuicao: string; // ex: "40" ou "nao_sei"
}

export interface FormDataState {
  segmento: "servicos" | "industria" | "varejo" | "saude_bem_estar" | "";
  gargalo: "vendas" | "operacao" | "";
  dor_dinamica: string;
  maturidade_dados: "estruturados" | "dispersos" | "manuais" | "";
  ferramental: string;
  faturamento: string;
  urgencia: string;
  canalPrincipal: string;
  quemVende: string;
  economicos: EconomicDataState;
  nome: string;
  nomeEmpresa: string;
  cargo: string;
  email: string;
  whatsapp: string;
  site: string;
  consentimento: boolean;
}

const initialFormData: FormDataState = {
  segmento: "",
  gargalo: "",
  dor_dinamica: "",
  maturidade_dados: "dispersos",
  ferramental: "",
  faturamento: "",
  urgencia: "",
  canalPrincipal: "",
  quemVende: "",
  economicos: {
    leadsMensais: "",
    taxaConversao: "",
    ticketMedio: "",
    tempoResposta: "",
    horasManuais: "",
    margemContribuicao: "",
  },
  nome: "",
  nomeEmpresa: "",
  cargo: "",
  email: "",
  whatsapp: "",
  site: "",
  consentimento: false,
};

export const AssessmentForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Funil: registra cada etapa vista (anônimo, sem dados pessoais)
  React.useEffect(() => {
    track("step_view", { step: currentStep });
  }, [currentStep]);

  // Total de 7 etapas organizadas
  const totalSteps = 7;

  const handleSelectOption = (field: keyof FormDataState, value: string) => {
    setErrorMessage(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleEconomicChange = (field: keyof EconomicDataState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      economicos: {
        ...prev.economicos,
        [field]: value,
      },
    }));
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setErrorMessage(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const nextStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // Helper para rótulos legíveis
  const getSegmentoLabel = (seg: string) => {
    switch (seg) {
      case "servicos":
        return "Serviços B2B / SaaS / Clínicas";
      case "industria":
        return "Indústria / Manufatura";
      case "varejo":
        return "Varejo / E-commerce";
      case "saude_bem_estar":
        return "Saúde, Bem-estar e Terapias";
      default:
        return seg || "Não especificado";
    }
  };

  // Pergunta dinâmica da Etapa 3 (Matriz Cruzada)
  const getDynamicQuestionData = () => {
    const isIndustriaOperacao =
      formData.segmento === "industria" && formData.gargalo === "operacao";
    const isServicosVendas =
      formData.segmento === "servicos" && formData.gargalo === "vendas";
    const isVarejoVendas =
      formData.segmento === "varejo" && formData.gargalo === "vendas";

    if (isIndustriaOperacao) {
      return {
        tag: "Indústria + Compras & Suprimentos",
        pergunta: "Quanto tempo sua equipe perde homologando fornecedores e cotando manualmente?",
        subtitulo: "Identifique o impacto operacional e a lentidão nas aquisições de insumos:",
        opcoes: [
          {
            title: "Mais de 15 horas por semana em cotações e no acompanhamento manual de fornecedores",
            desc: "Equipe sobrecarregada com tarefas repetitivas e risco de atrasos na produção.",
            icon: Clock,
          },
          {
            title: "Entre 5 e 15 horas semanais comparando propostas em planilhas e e-mails",
            desc: "Falta de histórico unificado de preços e demora nas aprovações de compras.",
            icon: Layers,
          },
          {
            title: "Menos de 5 horas, mas sem histórico consolidado e risco de sobrepreço",
            desc: "Ausência de inteligência analítica em compras e auditoria de alçadas.",
            icon: ShieldCheck,
          },
        ],
      };
    }

    if (isServicosVendas) {
      return {
        tag: "Serviços B2B / Consultorias + Vendas",
        pergunta: "Como sua empresa avalia a velocidade de resposta e a triagem de novos contatos?",
        subtitulo: "Mensure o tempo de resposta e a taxa de fechamento:",
        opcoes: [
          {
            title: "A resposta demora mais de 15 minutos (o cliente esfria antes do primeiro contato)",
            desc: "Novos contatos aguardam horas por retorno e acabam fechando com concorrentes.",
            icon: Clock,
          },
          {
            title: "Prospecção 100% manual e dependência excessiva de indicações",
            desc: "Falta de previsibilidade na geração de novas contas e pipeline oscilante.",
            icon: Target,
          },
          {
            title: "Vendedores experientes perdem reuniões com contatos fora do perfil ideal",
            desc: "Ausência de triagem inteligente prévia para blindar a agenda do time.",
            icon: Clock,
          },
        ],
      };
    }

    if (isVarejoVendas) {
      return {
        tag: "Varejo & Canais Digitais + Vendas",
        pergunta: "Qual o maior gargalo na retenção e recuperação de pedidos pendentes?",
        subtitulo: "Identifique onde a receita está escapando:",
        opcoes: [
          {
            title: "Nenhuma ação para recuperar orçamentos, PIX e carrinhos abandonados",
            desc: "Receita deixada na mesa por falta de gatilhos automáticos e imediatos de contato.",
            icon: DollarSign,
          },
          {
            title: "Mensagens enviadas à mão, sem personalização e sem o momento certo",
            desc: "Comunicação genérica de baixa conversão e erosão de margem com descontos.",
            icon: Layers,
          },
          {
            title: "Nenhuma ação para o cliente comprar de novo (cada cliente compra uma vez só)",
            desc: "Dependência contínua de tráfego pago com CAC crescente e LTV estagnado.",
            icon: TrendingUp,
          },
        ],
      };
    }

    // Fallbacks contextuais
    if (formData.gargalo === "vendas") {
      return {
        tag: "Comercial & Conversão",
        pergunta: "Onde reside a maior dificuldade na sua esteira de vendas hoje?",
        subtitulo: "Selecione o sintoma que mais trava o crescimento:",
        opcoes: [
          {
            title: "Venda demorada e sem acompanhamento automático depois da proposta",
            desc: "Propostas enviadas ficam sem resposta por falta de cadência estruturada.",
            icon: Clock,
          },
          {
            title: "Base de clientes inativa sem programa de reativação sistemático",
            desc: "Contas antigas esquecidas enquanto o time foca apenas em novos contatos.",
            icon: Layers,
          },
          {
            title: "CRM desatualizado e vendedores reportando dados em planilhas dispersas",
            desc: "Diretoria sem visibilidade do pipeline real e da previsibilidade de fechamentos.",
            icon: Database,
          },
        ],
      };
    }

    return {
      tag: "Backoffice & Operações",
      pergunta: "Qual a maior perda invisível de tempo na rotina operacional?",
      subtitulo: "Selecione o sintoma que mais consome horas e margem da equipe:",
      opcoes: [
        {
          title: "Digitação manual e conciliação de dados entre planilhas e sistemas diferentes",
          desc: "Equipe atuando como ponte humana com erros recorrentes de transcrição.",
          icon: Layers,
        },
        {
          title: "Atendimento e suporte sobrecarregados com dúvidas e confirmações repetitivas",
          desc: "Colaboradores presos respondendo status de solicitações básicas.",
          icon: Clock,
        },
        {
          title: "Aprovações lentas, espalhadas entre WhatsApp e e-mails",
          desc: "Gargalos de comunicação interna atrasando entregas ou faturamento.",
          icon: Clock,
        },
      ],
    };
  };

  const dynamicQuestionData = getDynamicQuestionData();

  // Validação do Passo Final
  const validateFinalStep = () => {
    if (!formData.nome.trim()) {
      setErrorMessage("Por favor, informe seu nome completo.");
      return false;
    }
    if (!formData.nomeEmpresa.trim()) {
      setErrorMessage("Por favor, informe o nome da sua empresa.");
      return false;
    }
    if (!formData.cargo) {
      setErrorMessage("Por favor, selecione seu cargo ou função executiva.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage("Por favor, informe um e-mail válido.");
      return false;
    }
    const cleanPhone = formData.whatsapp.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Por favor, informe seu WhatsApp com DDD (ex: 11 99999-9999).");
      return false;
    }
    if (!formData.consentimento) {
      setErrorMessage("Para gerar o diagnóstico, precisamos que você aceite o uso dos seus dados.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFinalStep()) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Parse seguro dos dados econômicos opcionais
    const parseNumOrNull = (v: string) => {
      if (!v || v === "nao_sei" || v === "Não sei") return null;
      const parsed = parseFloat(v.replace(/\./g, "").replace(",", "."));
      return isNaN(parsed) ? null : parsed;
    };

    const leadsNum = parseNumOrNull(formData.economicos.leadsMensais);
    const taxaNum = parseNumOrNull(formData.economicos.taxaConversao);
    const ticketNum = parseNumOrNull(formData.economicos.ticketMedio);
    const horasNum = parseNumOrNull(formData.economicos.horasManuais);
    const margemNum = parseNumOrNull(formData.economicos.margemContribuicao);

    const payload = {
      nome: formData.nome.trim(),
      nome_empresa: formData.nomeEmpresa.trim(),
      cargo: formData.cargo,
      email: formData.email.trim(),
      whatsapp: formData.whatsapp.trim(),
      site: formData.site.trim(),
      faturamento: formData.faturamento || "Não informado",
      segmento: formData.segmento,
      gargalo: formData.gargalo,
      respostas: {
        dor: formData.dor_dinamica,
        maturidade: formData.maturidade_dados,
        leads_mensais: leadsNum,
        taxa_conversao: taxaNum ? taxaNum / 100 : null,
        ticket_medio: ticketNum,
        horas_manuais: horasNum,
        margem_contribuicao: margemNum ? margemNum / 100 : null,
        tempo_resposta_declarado: formData.economicos.tempoResposta,
        canal_principal: formData.canalPrincipal || null,
        quem_vende: formData.quemVende || null,
        consentimento_lgpd: true,
        consentimento_em: new Date().toISOString(),
      },
      ferramental: formData.ferramental,
      urgencia: formData.urgencia || "Planejamento",
      created_at: new Date().toISOString(),
    };

    try {
      // Envio via função segura do banco (RPC): a tabela não é acessível diretamente pelo navegador
      const { data: newId, error } = await supabase.rpc("pesquisa_submit_lead", { payload });

      if (error) {
        console.error("Erro ao registrar assessment no Supabase:", error);
        setErrorMessage(
          `Não foi possível registrar o diagnóstico: ${error.message || "Erro de conexão com o banco de dados."}`
        );
        setIsSubmitted(false);
      } else if (typeof newId === "string" && newId.length > 10) {
        track("submit_ok", { step: 7 });
        // Leva direto ao resultado: a página do diagnóstico aguarda a análise ficar pronta
        navigate(`/deck/diagnostico/${newId}`);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: unknown) {
      console.error("Exceção na transmissão do diagnóstico:", err);
      const msg = err instanceof Error ? err.message : "Erro inesperado de comunicação.";
      setErrorMessage(`Falha na comunicação com o servidor (${msg}).`);
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================================================
  // TELA DE SUCESSO & CONVERSÃO CONSULTIVA
  // ==============================================================
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-fade-in w-full max-w-3xl mx-auto">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-8 border border-[#D4AF37]/30">
          <svg className="w-10 h-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-6">Recebemos suas respostas!</h2>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          Estamos preparando o seu diagnóstico. Se preferir receber agora, fale com a gente no WhatsApp e enviamos o resultado por lá.
        </p>
        
        <a 
          href="https://wa.me/5514991241181?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20minha%20an%C3%A1lise" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#D4AF37] hover:bg-[#CFA661] text-black font-bold text-lg py-5 px-12 rounded-full transition-all transform hover:scale-105 flex items-center gap-3 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 0C5.385 0 0 5.386 0 12.035c0 2.656.69 5.228 2 7.5L.65 24l4.63-1.215c2.183 1.18 4.654 1.803 7.251 1.803 6.646 0 12.031-5.386 12.031-12.035C24.562 5.386 19.177 0 12.031 0zm0 22.42c-2.25 0-4.455-.605-6.386-1.75l-.458-.27-4.75 1.246 1.27-4.63-.298-.475A10.155 10.155 0 011.87 12.035c0-5.602 4.56-10.163 10.161-10.163 5.602 0 10.163 4.561 10.163 10.163 0 5.602-4.56 10.163-10.163 10.163zm5.586-7.616c-.305-.153-1.812-.895-2.093-.997-.281-.102-.486-.153-.69.153-.204.306-.79 1.002-.97 1.206-.18.204-.36.23-.665.077-1.74-.888-3.05-2.055-4.223-3.957-.183-.298-.02-.458.133-.61.137-.137.306-.356.46-.534.153-.178.204-.305.306-.51.102-.203.05-.382-.026-.535-.077-.152-.69-1.66-.945-2.274-.249-.597-.503-.517-.69-.526-.182-.01-.39-.012-.596-.012-.204 0-.536.077-.816.383-.28.306-1.071 1.047-1.071 2.553 0 1.506 1.096 2.96 1.25 3.164.152.204 2.155 3.29 5.222 4.552 2.052.846 2.872.923 3.968.784 1.21-.153 3.65-1.493 4.16-2.936.51-1.442.51-2.678.358-2.936-.153-.254-.56-.407-.866-.56z"/>
          </svg>
          Receber meu diagnóstico no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="w-full bg-ac-surface/90 border border-ac-border rounded-2xl p-6 sm:p-10 text-left shadow-ac-card backdrop-blur-md relative overflow-hidden">
      {/* Barra de Progresso com Rótulo Elegante */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-ac-secondary mb-2.5">
          <span className="uppercase tracking-wider font-semibold text-ac-gold">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-ac-muted">
            {currentStep === 1 && "Leva cerca de 3 minutos"}
            {currentStep === 2 && "Prioridade"}
            {currentStep === 3 && "O que mais dói"}
            {currentStep === 4 && "Como estão seus dados"}
            {currentStep === 5 && "Ferramentas que você usa"}
            {currentStep === 6 && "Seus números"}
            {currentStep === 7 && "Último passo"}
          </span>
        </div>
        <div className="w-full bg-ac-carbon h-1.5 rounded-full overflow-hidden border border-ac-border/60">
          <div
            className="bg-gradient-to-r from-ac-champagne to-ac-gold h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-ac-rose/10 border border-ac-rose/30 flex items-center gap-3 text-xs text-ac-rose animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 1: SEGMENTO DE ATUAÇÃO                                   */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
              Sobre a sua empresa
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
              Em qual setor sua empresa atua?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ac-secondary">
              Escolha o mais próximo. Adaptamos as perguntas e a estimativa ao seu mercado:
            </p>
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-5 mt-6">
            <button
              type="button"
              onClick={() => handleSelectOption("segmento", "servicos")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Serviços B2B / Consultorias / SaaS / Clínicas
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Negócios com ciclos de venda consultivos, triagem de contatos, agendas de especialistas e contratos corporativos.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("segmento", "industria")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Factory className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Indústria / Manufatura / Distribuição
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Operações com compras de matérias-primas, suprimentos, cotações de fornecedores e linhas de produção física.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("segmento", "varejo")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Varejo Multicanal / E-commerce / D2C
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Alto volume transacional, atendimento de suporte, recuperação de pedidos pendentes e esteiras de recompra.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("segmento", "saude_bem_estar")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Saúde, Bem-estar e Terapias
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Clínicas, consultórios, estúdios e espaços terapêuticos: agenda cheia, faltas, retorno de pacientes e atendimento por WhatsApp.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 2: ÁREA PRIORITÁRIA DE GARGALO                           */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
              Foco da Intervenção ({getSegmentoLabel(formData.segmento)})
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
              Onde reside o gargalo mais urgente de escala hoje?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ac-secondary">
              Defina se a prioridade máxima é acelerar novas receitas ou destravar a capacidade de entrega e backoffice:
            </p>
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5 mt-6">
            <button
              type="button"
              onClick={() => handleSelectOption("gargalo", "vendas")}
              className="p-6 sm:p-7 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md min-h-[220px]"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne mb-4 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-2 group-hover:text-ac-gold transition-colors">
                  Comercial, Prospecção e Conversão
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed mb-4">
                  Demora para responder novos contatos, triagem manual, falta de acompanhamento depois da proposta ou clientes antigos sem contato.
                </p>
              </div>
              <span className="text-[11px] font-mono text-ac-gold font-bold flex items-center gap-1.5 pt-2">
                Foco: Gerar & Converter Receita <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("gargalo", "operacao")}
              className="p-6 sm:p-7 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md min-h-[220px]"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-2 group-hover:text-ac-gold transition-colors">
                  Compras, Backoffice e Operações
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed mb-4">
                  Cotações demoradas com fornecedores, digitação repetitiva de dados, conferência manual de pedidos e retrabalho.
                </p>
              </div>
              <span className="text-[11px] font-mono text-ac-gold font-bold flex items-center gap-1.5 pt-2">
                Foco: Reduzir Custos & Liberar Horas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-ac-border">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 3: SINTOMA CRÍTICO (MATRIZ CRUZADA)                       */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
              {dynamicQuestionData.tag}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
              {dynamicQuestionData.pergunta}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ac-secondary">
              {dynamicQuestionData.subtitulo}
            </p>
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-5 mt-6">
            {dynamicQuestionData.opcoes.map((opcao, i) => {
              const IconComp = opcao.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectOption("dor_dinamica", opcao.title)}
                  className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-champagne shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                      {opcao.title}
                    </strong>
                    <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">{opcao.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-ac-border">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 4: MATURIDADE DOS DADOS                                  */}
      {/* ============================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
              Camada de Dados & Infraestrutura
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
              Como os dados e históricos da sua operação estão organizados hoje?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ac-secondary">
              A arquitetura tecnológica depende do nível de estruturação prévia das informações:
            </p>
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-5 mt-6">
            <button
              type="button"
              onClick={() => handleSelectOption("maturidade_dados", "manuais")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-ac-amber shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Predominantemente Manuais (Cadernos, WhatsApp e Memória)
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Os dados estão dispersos em anotações físicas ou mensagens soltas. Requer estruturação inicial da base (Fase 1 do roadmap).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("maturidade_dados", "dispersos")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-sky-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Sistemas e Planilhas Desconectadas (Ponte Humana)
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  A empresa utiliza ferramentas de mercado (ex: CRM, ERP, Excel), mas a equipe transcreve dados manualmente entre elas.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("maturidade_dados", "estruturados")}
              className="w-full p-5 sm:p-6 rounded-2xl border border-ac-border bg-ac-graphite/60 hover:bg-ac-surface hover:border-ac-champagne transition text-left flex items-start gap-4 sm:gap-5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-ac-surface border border-ac-border flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm sm:text-base font-bold text-ac-editorial block mb-1.5 group-hover:text-ac-gold transition-colors">
                  Base Estruturada & Conectável via API / Webhooks
                </strong>
                <p className="text-xs sm:text-sm text-ac-secondary leading-relaxed">
                  Os dados estão centralizados em banco relacional ou plataforma formal, prontos para integração de agentes autônomos.
                </p>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-ac-border">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 5: ECOSSISTEMA ATUAL & FATURAMENTO                       */}
      {/* ============================================================== */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
              Sobre a sua operação
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
              O que vocês usam hoje e quanto a empresa fatura?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ac-secondary">
              Trabalhamos com o que você já tem, sem precisar trocar tudo:
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="input-ferramental" className="block text-xs font-medium text-ac-secondary mb-1.5">
                Principais ferramentas em uso hoje (ex: RD Station, Hubspot, WhatsApp Web, Totvs, Excel):
              </label>
              <input
                id="input-ferramental"
                type="text"
                name="ferramental"
                value={formData.ferramental}
                onChange={handleInputChange}
                placeholder="Ex: WhatsApp Web, Pipedrive e Planilhas no Google Drive"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-3 text-xs sm:text-sm text-ac-editorial placeholder:text-ac-muted focus:outline-none focus:border-ac-champagne"
              />
            </div>

            <div>
              <label htmlFor="select-faturamento" className="block text-xs font-medium text-ac-secondary mb-1.5">
                Faixa aproximada de faturamento mensal:
              </label>
              <select
                id="select-faturamento"
                name="faturamento"
                value={formData.faturamento}
                onChange={handleInputChange}
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-3 text-xs sm:text-sm text-ac-editorial focus:outline-none focus:border-ac-champagne"
              >
                <option value="">Selecione a faixa aproximada</option>
                <option value="Até R$ 50k / mês">Até R$ 50 mil / mês</option>
                <option value="R$ 50k a R$ 150k / mês">R$ 50 mil a R$ 150 mil / mês</option>
                <option value="R$ 150k a R$ 300k / mês">R$ 150 mil a R$ 300 mil / mês</option>
                <option value="R$ 300k a R$ 1M / mês">R$ 300 mil a R$ 1 milhão / mês</option>
                <option value="Acima de R$ 1M / mês">Acima de R$ 1 milhão / mês</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-canal" className="block text-xs font-medium text-ac-secondary mb-1.5">
                De onde vêm hoje a maioria dos seus clientes? (opcional)
              </label>
              <select
                id="select-canal"
                name="canalPrincipal"
                value={formData.canalPrincipal}
                onChange={handleInputChange}
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-3 text-xs sm:text-sm text-ac-editorial focus:outline-none focus:border-ac-champagne"
              >
                <option value="">Selecione o canal principal</option>
                <option value="Indicação de clientes">Indicação de clientes</option>
                <option value="WhatsApp e Instagram (orgânico)">WhatsApp e Instagram (orgânico)</option>
                <option value="Anúncios pagos">Anúncios pagos</option>
                <option value="Prospecção ativa da equipe">Prospecção ativa da equipe</option>
                <option value="Marketplaces ou representantes">Marketplaces ou representantes</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-quem-vende" className="block text-xs font-medium text-ac-secondary mb-1.5">
                Quem vende hoje? (opcional)
              </label>
              <select
                id="select-quem-vende"
                name="quemVende"
                value={formData.quemVende}
                onChange={handleInputChange}
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-3 text-xs sm:text-sm text-ac-editorial focus:outline-none focus:border-ac-champagne"
              >
                <option value="">Selecione</option>
                <option value="O dono vende sozinho">O dono vende sozinho</option>
                <option value="1 a 3 vendedores">1 a 3 vendedores</option>
                <option value="Time comercial com mais de 3 pessoas">Time comercial com mais de 3 pessoas</option>
                <option value="Representantes ou parceiros externos">Representantes ou parceiros externos</option>
                <option value="Ainda não tenho comercial">Ainda não tenho comercial</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-urgencia" className="block text-xs font-medium text-ac-secondary mb-1.5">
                Para quando você quer resolver isso? (opcional)
              </label>
              <select
                id="select-urgencia"
                name="urgencia"
                value={formData.urgencia}
                onChange={handleInputChange}
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-3 text-xs sm:text-sm text-ac-editorial focus:outline-none focus:border-ac-champagne"
              >
                <option value="">Selecione o prazo</option>
                <option value="Imediata (próximos 30 dias)">Imediata (próximos 30 dias)</option>
                <option value="Neste trimestre">Neste trimestre</option>
                <option value="Planejamento">Planejamento, sem prazo definido</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-ac-border flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={!formData.faturamento}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ac-champagne hover:bg-ac-champagneHover text-ac-carbon font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 6: DADOS ECONÔMICOS PARA FP&A (OPCIONAL / COM 'NÃO SEI')   */}
      {/* ============================================================== */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-ac-gold font-semibold block mb-1">
                Opcional
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
                Seus números (aproximados já servem)
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ac-secondary leading-relaxed">
                Esses números deixam a estimativa em reais mais precisa. Caso não saiba com exatidão, selecione "Não sei informar" — nunca inventamos números.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-ac-surface border border-ac-border text-[10px] font-mono text-ac-secondary uppercase shrink-0">
              Opcional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo 1: Volume de Leads / Oportunidades */}
            <div className="p-4 rounded-xl bg-ac-graphite/60 border border-ac-border">
              <label htmlFor="input-leads-mensais" className="block text-xs font-medium text-ac-editorial mb-1">
                Contatos novos (pedidos de orçamento, mensagens, indicações) por mês:
              </label>
              <div className="flex gap-2">
                <input
                  id="input-leads-mensais"
                  type="text"
                  placeholder="Ex: 150"
                  value={formData.economicos.leadsMensais}
                  onChange={(e) => handleEconomicChange("leadsMensais", e.target.value)}
                  disabled={formData.economicos.leadsMensais === "Não sei" || formData.economicos.leadsMensais === "nao_sei"}
                  className="w-full bg-ac-carbon border border-ac-border rounded-lg px-3 py-2 text-xs text-ac-editorial placeholder:text-ac-muted focus:border-ac-champagne disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleEconomicChange(
                      "leadsMensais",
                      formData.economicos.leadsMensais === "Não sei" || formData.economicos.leadsMensais === "nao_sei"
                        ? ""
                        : "Não sei"
                    )
                  }
                  className={`px-3 py-2 text-[11px] font-mono rounded-lg border transition whitespace-nowrap cursor-pointer ${
                    formData.economicos.leadsMensais === "Não sei" || formData.economicos.leadsMensais === "nao_sei"
                      ? "bg-ac-champagne/20 border-ac-champagne text-ac-gold font-bold"
                      : "bg-ac-surface border-ac-border text-ac-secondary hover:text-ac-editorial"
                  }`}
                >
                  {formData.economicos.leadsMensais === "Não sei" || formData.economicos.leadsMensais === "nao_sei" ? "Não sei ✓" : "Não sei"}
                </button>
              </div>
            </div>

            {/* Campo 2: Taxa Atual de Conversão */}
            <div className="p-4 rounded-xl bg-ac-graphite/60 border border-ac-border">
              <label htmlFor="input-taxa-conversao" className="block text-xs font-medium text-ac-editorial mb-1">
                Taxa atual de conversão comercial (%):
              </label>
              <div className="flex gap-2">
                <input
                  id="input-taxa-conversao"
                  type="text"
                  placeholder="Ex: 5 para 5%"
                  value={formData.economicos.taxaConversao}
                  onChange={(e) => handleEconomicChange("taxaConversao", e.target.value)}
                  disabled={formData.economicos.taxaConversao === "Não sei" || formData.economicos.taxaConversao === "nao_sei"}
                  className="w-full bg-ac-carbon border border-ac-border rounded-lg px-3 py-2 text-xs text-ac-editorial placeholder:text-ac-muted focus:border-ac-champagne disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleEconomicChange(
                      "taxaConversao",
                      formData.economicos.taxaConversao === "Não sei" || formData.economicos.taxaConversao === "nao_sei"
                        ? ""
                        : "Não sei"
                    )
                  }
                  className={`px-3 py-2 text-[11px] font-mono rounded-lg border transition whitespace-nowrap cursor-pointer ${
                    formData.economicos.taxaConversao === "Não sei" || formData.economicos.taxaConversao === "nao_sei"
                      ? "bg-ac-champagne/20 border-ac-champagne text-ac-gold font-bold"
                      : "bg-ac-surface border-ac-border text-ac-secondary hover:text-ac-editorial"
                  }`}
                >
                  {formData.economicos.taxaConversao === "Não sei" || formData.economicos.taxaConversao === "nao_sei" ? "Não sei ✓" : "Não sei"}
                </button>
              </div>
            </div>

            {/* Campo 3: Ticket Médio */}
            <div className="p-4 rounded-xl bg-ac-graphite/60 border border-ac-border">
              <label htmlFor="input-ticket-medio" className="block text-xs font-medium text-ac-editorial mb-1">
                Ticket médio aproximado (R$):
              </label>
              <div className="flex gap-2">
                <input
                  id="input-ticket-medio"
                  type="text"
                  placeholder="Ex: 2500"
                  value={formData.economicos.ticketMedio}
                  onChange={(e) => handleEconomicChange("ticketMedio", e.target.value)}
                  disabled={formData.economicos.ticketMedio === "Não sei" || formData.economicos.ticketMedio === "nao_sei"}
                  className="w-full bg-ac-carbon border border-ac-border rounded-lg px-3 py-2 text-xs text-ac-editorial placeholder:text-ac-muted focus:border-ac-champagne disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleEconomicChange(
                      "ticketMedio",
                      formData.economicos.ticketMedio === "Não sei" || formData.economicos.ticketMedio === "nao_sei"
                        ? ""
                        : "Não sei"
                    )
                  }
                  className={`px-3 py-2 text-[11px] font-mono rounded-lg border transition whitespace-nowrap cursor-pointer ${
                    formData.economicos.ticketMedio === "Não sei" || formData.economicos.ticketMedio === "nao_sei"
                      ? "bg-ac-champagne/20 border-ac-champagne text-ac-gold font-bold"
                      : "bg-ac-surface border-ac-border text-ac-secondary hover:text-ac-editorial"
                  }`}
                >
                  {formData.economicos.ticketMedio === "Não sei" || formData.economicos.ticketMedio === "nao_sei" ? "Não sei ✓" : "Não sei"}
                </button>
              </div>
            </div>

            {/* Campo 4: Horas Manuais em Rotinas */}
            <div className="p-4 rounded-xl bg-ac-graphite/60 border border-ac-border">
              <label htmlFor="input-horas-manuais" className="block text-xs font-medium text-ac-editorial mb-1">
                Horas mensais gastas em tarefas manuais (equipe):
              </label>
              <div className="flex gap-2">
                <input
                  id="input-horas-manuais"
                  type="text"
                  placeholder="Ex: 40 horas/mês"
                  value={formData.economicos.horasManuais}
                  onChange={(e) => handleEconomicChange("horasManuais", e.target.value)}
                  disabled={formData.economicos.horasManuais === "Não sei" || formData.economicos.horasManuais === "nao_sei"}
                  className="w-full bg-ac-carbon border border-ac-border rounded-lg px-3 py-2 text-xs text-ac-editorial placeholder:text-ac-muted focus:border-ac-champagne disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleEconomicChange(
                      "horasManuais",
                      formData.economicos.horasManuais === "Não sei" || formData.economicos.horasManuais === "nao_sei"
                        ? ""
                        : "Não sei"
                    )
                  }
                  className={`px-3 py-2 text-[11px] font-mono rounded-lg border transition whitespace-nowrap cursor-pointer ${
                    formData.economicos.horasManuais === "Não sei" || formData.economicos.horasManuais === "nao_sei"
                      ? "bg-ac-champagne/20 border-ac-champagne text-ac-gold font-bold"
                      : "bg-ac-surface border-ac-border text-ac-secondary hover:text-ac-editorial"
                  }`}
                >
                  {formData.economicos.horasManuais === "Não sei" || formData.economicos.horasManuais === "nao_sei" ? "Não sei ✓" : "Não sei"}
                </button>
              </div>
            </div>

            {/* Campo 5: Tempo de resposta ao lead (opcional, não bloqueia o avanço) */}
            <div className="p-4 rounded-xl bg-ac-graphite/60 border border-ac-border sm:col-span-2">
              <label htmlFor="select-tempo-resposta" className="block text-xs font-medium text-ac-editorial mb-1">
                Quanto tempo leva, em média, para um novo contato receber a primeira resposta? (opcional)
              </label>
              <select
                id="select-tempo-resposta"
                value={formData.economicos.tempoResposta}
                onChange={(e) => handleEconomicChange("tempoResposta", e.target.value)}
                className="w-full bg-ac-carbon border border-ac-border rounded-lg px-3 py-2 text-xs text-ac-editorial focus:border-ac-champagne"
              >
                <option value="">Selecione</option>
                <option value="Menos de 15 minutos">Menos de 15 minutos</option>
                <option value="Entre 15 minutos e 1 hora">Entre 15 minutos e 1 hora</option>
                <option value="Entre 1 hora e 1 dia">Entre 1 hora e 1 dia</option>
                <option value="Mais de 1 dia">Mais de 1 dia</option>
                <option value="Não sei">Não sei</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-ac-border flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={
                !formData.economicos.leadsMensais ||
                !formData.economicos.taxaConversao ||
                !formData.economicos.ticketMedio ||
                !formData.economicos.horasManuais
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ac-champagne hover:bg-ac-champagneHover text-ac-carbon font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 7: CONTATO EXECUTIVO & DISPARO DO RELATÓRIO              */}
      {/* ============================================================== */}
      {currentStep === 7 && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#D7B779] font-semibold block mb-1">
              Finalização do Diagnóstico
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F3EF] tracking-tight">
              Para onde enviamos o seu resultado?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A8A9AC]">
              Preencha seus dados para ver o diagnóstico completo na próxima tela.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-nome" className="block text-xs font-medium text-ac-secondary mb-1">
                Seu nome completo *
              </label>
              <input
                id="input-nome"
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: Matheus Camargo"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              />
            </div>

            <div>
              <label htmlFor="input-empresa" className="block text-xs font-medium text-ac-secondary mb-1">
                Nome da sua empresa *
              </label>
              <input
                id="input-empresa"
                type="text"
                name="nomeEmpresa"
                required
                value={formData.nomeEmpresa}
                onChange={handleInputChange}
                placeholder="Ex: Camargo Soluções Industriais"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              />
            </div>

            <div>
              <label htmlFor="select-cargo" className="block text-xs font-medium text-ac-secondary mb-1">
                Seu cargo / função executiva *
              </label>
              <select
                id="select-cargo"
                name="cargo"
                required
                value={formData.cargo}
                onChange={handleInputChange}
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              >
                <option value="">Selecione seu cargo</option>
                <option value="Dono / Empresário(a)">Dono / Empresário(a)</option>
                <option value="CEO / Presidente">CEO / Presidente</option>
                <option value="Diretor Comercial / CRO">Diretor Comercial / CRO</option>
                <option value="Gerente de Compras / Suprimentos">Gerente de Compras / Suprimentos</option>
                <option value="Diretor de Operações (COO)">Diretor de Operações (COO)</option>
                <option value="Gerente Geral / Sócio">Gerente Geral / Sócio</option>
                <option value="Outro Cargo de Liderança">Outro cargo de liderança</option>
              </select>
            </div>

            <div>
              <label htmlFor="input-email" className="block text-xs font-medium text-ac-secondary mb-1">
                E-mail corporativo *
              </label>
              <input
                id="input-email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="voce@suaempresa.com.br"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              />
            </div>

            <div>
              <label htmlFor="input-whatsapp" className="block text-xs font-medium text-ac-secondary mb-1">
                WhatsApp com DDD (para envio do relatório) *
              </label>
              <input
                id="input-whatsapp"
                type="tel"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              />
            </div>

            <div>
              <label htmlFor="input-site" className="block text-xs font-medium text-ac-secondary mb-1">
                Website ou LinkedIn da empresa (Opcional)
              </label>
              <input
                id="input-site"
                type="text"
                name="site"
                value={formData.site}
                onChange={handleInputChange}
                placeholder="https://suaempresa.com.br"
                className="w-full bg-ac-graphite border border-ac-border rounded-xl px-4 py-2.5 text-xs text-ac-editorial focus:border-ac-champagne"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-xs text-ac-secondary leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consentimento}
              onChange={(e) => {
                setErrorMessage(null);
                setFormData((prev) => ({ ...prev, consentimento: e.target.checked }));
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]"
            />
            <span>
              Concordo que a Agência Camargo use meus dados para gerar meu diagnóstico e entrar em contato, conforme a{" "}
              <Link to="/privacidade" target="_blank" className="underline text-ac-gold">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          <div className="pt-4 border-t border-ac-border flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-ac-secondary hover:text-ac-editorial transition cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-ac-champagne hover:bg-ac-champagneHover text-ac-carbon font-extrabold text-xs uppercase tracking-wider transition shadow-ac-hover cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando seu diagnóstico...</span>
                </>
              ) : (
                <>
                  <span>Ver meu diagnóstico</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
