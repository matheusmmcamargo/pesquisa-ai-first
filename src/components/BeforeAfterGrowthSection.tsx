import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Sliders } from "lucide-react";
import type { AreaOption } from "../lib/diagnostic";

export interface BeforeAfterItem {
  dimensao: string;
  categoria: "fluxo" | "dados" | "velocidade" | "resultado";
  hoje: string;
  proposto: string;
  detalheHoje: string;
  detalheProposto: string;
  efeitoEsperado: string;
  etiquetaHoje: "Informado no diagnóstico" | "Gargalo declarado";
  etiquetaProposto: "Hipótese de melhoria" | "Resultado medido";
}

interface BeforeAfterGrowthSectionProps {
  area?: AreaOption;
  gargaloDeclarado?: string;
  empresaNome?: string;
}

export const BeforeAfterGrowthSection: React.FC<BeforeAfterGrowthSectionProps> = ({
  area = "comercial",
  gargaloDeclarado,
  empresaNome = "Sua Empresa",
}) => {
  const [visualizacao, setVisualizacao] = useState<"lado_a_lado" | "hoje" | "proposto">("lado_a_lado");

  // Itens dinâmicos adaptados por Área Operacional com dimensões executivas e efeito esperado
  const getItemsByArea = (areaSel: AreaOption): BeforeAfterItem[] => {
    if (areaSel === "operacao") {
      return [
        {
          dimensao: "Fluxo Operacional",
          categoria: "fluxo",
          hoje: "Retrabalho e tarefas manuais repetitivas",
          proposto: "Fluxos automatizados com supervisão humana",
          detalheHoje: gargaloDeclarado || "Colaboradores transcrevendo dados manualmente entre planilhas e e-mails.",
          detalheProposto: "Agentes operacionais orquestram rotinas com alçadas claras e intervenção sob demanda.",
          efeitoEsperado: "Eliminação de até 80% do retrabalho mecânico de transcrição",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Hipótese de melhoria",
        },
        {
          dimensao: "Dados e Visibilidade",
          categoria: "dados",
          hoje: "Decisões com dados fragmentados e atrasados",
          proposto: "Indicadores centralizados e rastreáveis em tempo real",
          detalheHoje: "Diretoria descobre gargalos semanas após o fato; visibilidade parcial da capacidade.",
          detalheProposto: "Camada de dados unificada no Supabase com dashboards executivos em tempo real.",
          efeitoEsperado: "Visibilidade em tempo real de capacidade instalada vs demandada",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Hipótese de melhoria",
        },
        {
          dimensao: "Velocidade, Resposta & Controle",
          categoria: "velocidade",
          hoje: "Sobrecarga de pessoas para absorver novos clientes",
          proposto: "Escala operacional elástica sem inflar folha",
          detalheHoje: "Qualquer pico de demanda gera gargalo, atraso e risco de erro em processos críticos.",
          detalheProposto: "Tarefas de baixa complexidade desmobilizadas; equipe sênior foca em valor estratégico.",
          efeitoEsperado: "Liberação de 30h a 50h/mês de profissionais-chave para expansão",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Resultado medido",
        },
        {
          dimensao: "Mensuração de Impacto",
          categoria: "resultado",
          hoje: "Resultado difícil de medir e auditar",
          proposto: "Baseline, metas e resultados acompanhados por SLA",
          detalheHoje: "Percepção subjetiva de ganho sem comprovação contábil de tempo ou despesa evitada.",
          detalheProposto: "Instrumentação de horas liberadas e custos de processo antes e depois da implantação.",
          efeitoEsperado: "Comprovação de ROI e auditoria contínua de produtividade",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Resultado medido",
        },
      ];
    }

    if (areaSel === "compras") {
      return [
        {
          dimensao: "Fluxo Operacional",
          categoria: "fluxo",
          hoje: "Cotações manuais dispersas por WhatsApp e e-mail",
          proposto: "Centralização e histórico comparativo com inteligência",
          detalheHoje: gargaloDeclarado || "Compradores gastando dias para consolidar orçamentos e comparar propostas.",
          detalheProposto: "Agente de triagem organiza propostas, compara tabelas e aponta desvios de preço.",
          efeitoEsperado: "Ciclo de cotação reduzido de 5 dias para menos de 24 horas",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Hipótese de melhoria",
        },
        {
          dimensao: "Dados e Visibilidade",
          categoria: "dados",
          hoje: "Histórico disperso e descontrole de conformidade",
          proposto: "Alçadas digitais ágeis com validação de conformidade",
          detalheHoje: "Pedidos parados esperando e-mail do gestor; compras urgentes feitas no improviso.",
          detalheProposto: "Roteamento inteligente de aprovações com regras orçamentárias pré-validadas.",
          efeitoEsperado: "Conformidade de 100% dos pedidos com a política de compras",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Hipótese de melhoria",
        },
        {
          dimensao: "Velocidade, Resposta & Controle",
          categoria: "velocidade",
          hoje: "Divergências de nota, fretes emergenciais e retrabalho",
          proposto: "Prevenção de sobrepreço e eliminação de perdas",
          detalheHoje: "Falta de confronto automático entre pedido e nota fiscal recebida.",
          detalheProposto: "Validação sistêmica imediata antes do pagamento e redução de custo operacional.",
          efeitoEsperado: "Prevenção de divergências de faturamento e fretes não planejados",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Hipótese de melhoria",
        },
        {
          dimensao: "Mensuração de Impacto",
          categoria: "resultado",
          hoje: "Resultado difícil de auditar por fornecedor",
          proposto: "Painel de compras com custo por pedido e SLA",
          detalheHoje: "Histórico fica na memória dos compradores ou em arquivos descentralizados.",
          detalheProposto: "Indicadores claros de tempo médio de ciclo, economia obtida e confiabilidade.",
          efeitoEsperado: "Redução de custo de processo por ordem de compra e SLA controlado",
          etiquetaHoje: "Informado no diagnóstico",
          etiquetaProposto: "Resultado medido",
        },
      ];
    }

    // Default: Comercial
    return [
      {
        dimensao: "Fluxo Operacional",
        categoria: "fluxo",
        hoje: "Contatos sem acompanhamento e demora na primeira resposta",
        proposto: "Pipeline e follow-up estruturados com SLA imediato (< 5m)",
        detalheHoje: gargaloDeclarado || "Leads esfriam esperando resposta humana fora de hora ou em picos de tráfego.",
        detalheProposto: "Agente de triagem qualifica, responde em segundos e agenda na agenda do executivo.",
        efeitoEsperado: "Tempo de primeiro contato reduzido de 2h+ para menos de 5 minutos",
        etiquetaHoje: "Informado no diagnóstico",
        etiquetaProposto: "Hipótese de melhoria",
      },
      {
        dimensao: "Dados e Visibilidade",
        categoria: "dados",
        hoje: "Decisões com dados fragmentados em WhatsApp e planilhas",
        proposto: "Indicadores centralizados e rastreáveis do clique ao fechamento",
        detalheHoje: "Impossível saber qual canal traz clientes de maior margem ou onde o funil está vazando.",
        detalheProposto: "Banco unificado no Supabase, rastreabilidade de CAC, LTV e conversão por etapa.",
        efeitoEsperado: "Visibilidade de 100% da jornada do lead e origens de alta conversão",
        etiquetaHoje: "Informado no diagnóstico",
        etiquetaProposto: "Hipótese de melhoria",
      },
      {
        dimensao: "Velocidade, Resposta & Controle",
        categoria: "velocidade",
        hoje: "Executivos seniores perdendo horas com contatos desqualificados",
        proposto: "Foco exclusivo em reuniões com decisores com perfil (ICP)",
        detalheHoje: "Tempo nobre da equipe consumido em explicar preços a curiosos sem orçamento.",
        detalheProposto: "Pré-filtro inteligente entrega oportunidade validada, perfil traçado e dor mapeada.",
        efeitoEsperado: "Elevação da taxa de comparecimento (show-up) e reuniões qualificadas",
        etiquetaHoje: "Informado no diagnóstico",
        etiquetaProposto: "Resultado medido",
      },
      {
        dimensao: "Mensuração de Impacto",
        categoria: "resultado",
        hoje: "Resultado difícil de medir e atribuir com certeza",
        proposto: "Baseline, metas contratuais e resultados acompanhados",
        detalheHoje: "Campanhas e ferramentas isoladas sem demonstrativo claro de retorno sobre o investimento.",
        detalheProposto: "Acompanhamento formal do KPI contratual: taxa de conversão e receita incremental.",
        efeitoEsperado: "Crescimento mensurável de conversão e retorno econômico comprovado",
        etiquetaHoje: "Informado no diagnóstico",
        etiquetaProposto: "Resultado medido",
      },
    ];
  };

  const items = getItemsByArea(area);

  return (
    <div className="w-full rounded-3xl bg-[#141516] border border-[#2E2E34] p-6 sm:p-10 text-[#F5F3EF] shadow-2xl relative overflow-hidden">

      {/* Cabeçalho do Componente */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#2E2E34] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-[#B38D64] bg-[#B38D64]/10 border border-[#B38D64]/20 mb-3">
            <span>Transformação Estrutural — {empresaNome}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F3EF]">
            Hoje você opera assim.{" "}
            <span className="text-[#D7B779]">
              Amanhã pode operar melhor.
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#A8A9AC] max-w-xl">
            Contraste objetivo entre o modelo operacional declarado e a arquitetura recomendada sob supervisão da Agência Camargo.
          </p>
        </div>

        {/* Controles de Alternância (Lado a lado / Hoje / Proposto) */}
        <div className="inline-flex p-1 rounded-xl bg-[#0B0C0D] border border-[#2E2E34] self-start md:self-auto print:hidden">
          <button
            type="button"
            onClick={() => setVisualizacao("lado_a_lado")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              visualizacao === "lado_a_lado"
                ? "bg-[#1B1C1E] text-[#D7B779] font-bold shadow"
                : "text-[#A8A9AC] hover:text-[#F5F3EF]"
            }`}
          >
            Lado a Lado
          </button>
          <button
            type="button"
            onClick={() => setVisualizacao("hoje")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              visualizacao === "hoje"
                ? "bg-amber-950/40 text-amber-300 font-bold border border-amber-800/40"
                : "text-[#A8A9AC] hover:text-[#F5F3EF]"
            }`}
          >
            Apenas Hoje
          </button>
          <button
            type="button"
            onClick={() => setVisualizacao("proposto")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              visualizacao === "proposto"
                ? "bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-800/40"
                : "text-[#A8A9AC] hover:text-[#F5F3EF]"
            }`}
          >
            Cenário Proposto
          </button>
        </div>
      </div>

      {/* Grid de Linhas Comparativas */}
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div
            key={it.dimensao}
            className="rounded-2xl border border-[#2E2E34] bg-[#0B0C0D] p-5 sm:p-6 transition hover:border-[#B38D64]/40"
          >
            {/* Tag da Dimensão */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#A8A9AC]">
                0{idx + 1} • {it.dimensao}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#71717A] hidden sm:inline">
                  Área: {area.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              {/* Lado Esquerdo: HOJE (Tensão / Fricção em Vermelho/Âmbar) */}
              {(visualizacao === "lado_a_lado" || visualizacao === "hoje") && (
                <div
                  className={`p-5 rounded-xl border border-[#A94F4F]/40 bg-[#A94F4F]/10 flex flex-col justify-between transition motion-reduce:transition-none ${
                    visualizacao === "hoje" ? "lg:col-span-2" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D68A2D] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D68A2D]" />
                        Situação Atual Declarada
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161618] text-[#A8A9AC] border border-[#2E2E34]">
                        {it.etiquetaHoje}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#F5F3EF] leading-snug mb-2">
                      {it.hoje}
                    </div>
                    <p className="text-xs text-[#A8A9AC] leading-relaxed">
                      {it.detalheHoje}
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-[#A94F4F]/20 text-[10px] font-mono text-[#D68A2D]">
                    Fricção diagnosticada: Impacto em margem e velocidade
                  </div>
                </div>
              )}

              {/* Lado Direito: CENÁRIO PROPOSTO (Ganho / Eficiência em Verde/Champagne) */}
              {(visualizacao === "lado_a_lado" || visualizacao === "proposto") && (
                <div
                  className={`p-5 rounded-xl border border-[#1FA971]/40 bg-[#1FA971]/10 flex flex-col justify-between transition motion-reduce:transition-none ${
                    visualizacao === "proposto" ? "lg:col-span-2" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2CCB8F] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2CCB8F]" />
                        Arquitetura Proposta (Método AC)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#B38D64]/10 text-[#D7B779] border border-[#B38D64]/30 font-medium">
                        {it.etiquetaProposto}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#F5F3EF] leading-snug mb-2">
                      {it.proposto}
                    </div>
                    <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">
                      {it.detalheProposto}
                    </p>
                  </div>

                  {/* Faixa com Efeito Esperado */}
                  <div className="mt-2 pt-2.5 border-t border-[#1FA971]/30 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1FA971]/20 text-[#2CCB8F] border border-[#1FA971]/40">
                      Efeito Esperado:
                    </span>
                    <span className="text-xs text-[#F5F3EF] font-semibold">
                      {it.efeitoEsperado}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nota de Governança e Transparência */}
      <div className="mt-6 pt-5 border-t border-[#2E2E34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A8A9AC]">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#B38D64]" />
          <span>Premissas sujeitas a validação técnica de baseline na Sessão de Arquitetura.</span>
        </div>
        <div className="font-mono text-[11px] text-[#71717A]">
          Metodologia AC • Growth AI Platform
        </div>
      </div>
    </div>
  );
};
