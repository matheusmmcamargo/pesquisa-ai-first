import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Calculator,
  ArrowUpRight,
} from "lucide-react";
import { simularImpactoFinanceiro } from "../lib/financialEngine";
import type {
  CommercialEconomicInputs,
  OperationalEconomicInputs,
  MetricStatus,
} from "../lib/financialEngine";

interface FinancialImpactEngineProps {
  initialCommercial?: Partial<CommercialEconomicInputs>;
  initialOperational?: Partial<OperationalEconomicInputs>;
  alavancaPrioritaria?: "gerar_receita" | "converter_receita" | "reduzir_custos" | "aumentar_capacidade";
  empresaNome?: string;
  readOnly?: boolean;
}

export const FinancialImpactEngine: React.FC<FinancialImpactEngineProps> = ({
  initialCommercial,
  initialOperational,
  alavancaPrioritaria = "converter_receita",
  empresaNome = "Sua Empresa",
}) => {
  // Estados dos inputs interativos do simulador
  const [leadsMensais, setLeadsMensais] = useState<number | null>(
    initialCommercial?.leadsMensais ?? (initialCommercial?.leadsMensais === null ? null : 150)
  );
  const [taxaConversaoAtual, setTaxaConversaoAtual] = useState<number | null>(
    initialCommercial?.taxaConversaoAtual ?? (initialCommercial?.taxaConversaoAtual === null ? null : 0.05)
  );
  const [ticketMedio, setTicketMedio] = useState<number | null>(
    initialCommercial?.ticketMedio ?? (initialCommercial?.ticketMedio === null ? null : 2500)
  );
  const [margemContribuicao] = useState<number | null>(
    initialCommercial?.margemContribuicao ?? (initialCommercial?.margemContribuicao === null ? null : 0.40)
  );

  const [horasManuais, setHorasManuais] = useState<number | null>(
    initialOperational?.horasManuaisMensais ?? (initialOperational?.horasManuaisMensais === null ? null : 45)
  );
  const [custoHoraHomem] = useState<number | null>(
    initialOperational?.custoHoraHomem ?? null
  );

  // Cenário selecionado para detalhamento
  const [activeScenario, setActiveScenario] = useState<"Conservador" | "Base" | "Expansão">("Base");

  // Executa o motor FP&A reactivamente
  const simulacao = useMemo(() => {
    return simularImpactoFinanceiro(
      {
        leadsMensais,
        taxaConversaoAtual,
        ticketMedio,
        tempoPrimeiraRespostaHoras: initialCommercial?.tempoPrimeiraRespostaHoras ?? null,
        possuiFollowUpEstruturado: initialCommercial?.possuiFollowUpEstruturado ?? null,
        agendamentosMensais: initialCommercial?.agendamentosMensais ?? null,
        margemContribuicao,
      },
      {
        horasManuaisMensais: horasManuais,
        processosRepetitivosContagem: initialOperational?.processosRepetitivosContagem ?? 3,
        tempoMedioExecucaoMinutos: initialOperational?.tempoMedioExecucaoMinutos ?? 30,
        taxaRetrabalho: initialOperational?.taxaRetrabalho ?? null,
        custoHoraHomem,
        capacidadeAtendimentoMensal: initialOperational?.capacidadeAtendimentoMensal ?? null,
      },
      alavancaPrioritaria,
      null,
      null
    );
  }, [
    leadsMensais,
    taxaConversaoAtual,
    ticketMedio,
    margemContribuicao,
    horasManuais,
    custoHoraHomem,
    alavancaPrioritaria,
    initialCommercial,
    initialOperational,
  ]);

  const cenarioAtualObj =
    activeScenario === "Conservador"
      ? simulacao.cenarios.conservador
      : activeScenario === "Expansão"
      ? simulacao.cenarios.expansao
      : simulacao.cenarios.base;

  const rotuloCenario = (s: "Conservador" | "Base" | "Expansão") => (s === "Expansão" ? "Ampla" : s);

  const formatBRL = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "Não calculado";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
      val
    );
  };

  const getStatusBadge = (status: MetricStatus) => {
    switch (status) {
      case "INFORMADO":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-ac-graphite text-ac-secondary border border-ac-border">
            Informado
          </span>
        );
      case "CALCULADO":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sky-950/40 text-sky-400 border border-sky-800/40">
            Calculado
          </span>
        );
      case "SIMULADO":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-ac-champagne/15 text-ac-champagne border border-ac-champagne/30">
            Estimado
          </span>
        );
      case "A_MEDIR":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-ac-amber/15 text-ac-amber border border-ac-amber/30">
            A confirmar
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-ac-graphite border border-ac-border rounded-2xl p-6 sm:p-8 text-ac-editorial relative overflow-hidden shadow-ac-card print-avoid-break">
      {/* Luz sutil de fundo */}

      {/* Header do Engine */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-ac-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-ac-gold" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-ac-gold font-bold">
              Simulador de perda
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-ac-editorial tracking-tight">
            Simule com os seus números
          </h3>
          <p className="text-xs sm:text-sm text-ac-secondary max-w-2xl mt-1">
            Estimativa a partir dos números que você informou sobre {empresaNome}: quanto escapa por mês com o processo como está hoje. Mexa nos controles para testar cada cenário.
          </p>
        </div>
      </div>

      {/* Aviso Metodológico quando faltarem dados fundamentais */}
      {!simulacao.podeCalcularReceita && (
        <div className="my-5 p-4 rounded-xl bg-ac-amber/10 border border-ac-amber/30 flex items-start gap-3 text-xs text-ac-amber">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm font-bold text-ac-editorial mb-1">
              Faltam alguns números para calcular a perda em vendas
            </strong>
            <p className="text-ac-secondary leading-relaxed">
              Não foram informados: <strong className="text-ac-editorial">{simulacao.dadosAusentes.join(", ")}</strong>. Para não apresentar números inventados, deixamos esses valores em aberto. Na reunião completamos esses dados com você.
            </p>
          </div>
        </div>
      )}

      {/* Painel Central: Controles Interativos (Sliders) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 print:hidden">
        {/* Lado Esquerdo: Sliders de Entrada */}
        <div className="lg:col-span-5 space-y-5 bg-ac-surface/60 p-5 rounded-xl border border-ac-border">
          <div className="flex items-center justify-between border-b border-ac-border pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ac-champagne flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Seus números
            </span>
            <span className="text-[10px] text-ac-muted font-mono">Arraste para ajustar</span>
          </div>

          {/* Slider 1: Volume de Leads Mensais */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="range-leads" className="text-ac-secondary font-medium">Contatos novos por mês:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-ac-editorial">
                  {leadsMensais !== null ? `${leadsMensais} /mês` : "Não informado"}
                </span>
                <button
                  type="button"
                  onClick={() => setLeadsMensais(leadsMensais === null ? 150 : null)}
                  className="text-[10px] text-ac-muted underline hover:text-ac-champagne cursor-pointer"
                >
                  {leadsMensais === null ? "Informar" : "Não sei"}
                </button>
              </div>
            </div>
            {leadsMensais !== null && (
              <input
                id="range-leads"
                type="range"
                min="10"
                max="2000"
                step="10"
                value={leadsMensais}
                onChange={(e) => setLeadsMensais(Number(e.target.value))}
                className="w-full"
              />
            )}
          </div>

          {/* Slider 2: Taxa de Conversão Atual */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="range-taxa" className="text-ac-secondary font-medium">Quantos viram cliente:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-ac-editorial">
                  {taxaConversaoAtual !== null ? `${(taxaConversaoAtual * 100).toFixed(1)}%` : "Não informado"}
                </span>
                <button
                  type="button"
                  onClick={() => setTaxaConversaoAtual(taxaConversaoAtual === null ? 0.05 : null)}
                  className="text-[10px] text-ac-muted underline hover:text-ac-champagne cursor-pointer"
                >
                  {taxaConversaoAtual === null ? "Informar" : "Não sei"}
                </button>
              </div>
            </div>
            {taxaConversaoAtual !== null && (
              <input
                id="range-taxa"
                type="range"
                min="0.01"
                max="0.40"
                step="0.005"
                value={taxaConversaoAtual}
                onChange={(e) => setTaxaConversaoAtual(Number(e.target.value))}
                className="w-full"
              />
            )}
          </div>

          {/* Slider 3: Ticket Médio */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="range-ticket" className="text-ac-secondary font-medium">Ticket médio por venda:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-ac-editorial">
                  {ticketMedio !== null ? formatBRL(ticketMedio) : "Não informado"}
                </span>
                <button
                  type="button"
                  onClick={() => setTicketMedio(ticketMedio === null ? 2500 : null)}
                  className="text-[10px] text-ac-muted underline hover:text-ac-champagne cursor-pointer"
                >
                  {ticketMedio === null ? "Informar" : "Não sei"}
                </button>
              </div>
            </div>
            {ticketMedio !== null && (
              <input
                id="range-ticket"
                type="range"
                min="100"
                max="50000"
                step="250"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full"
              />
            )}
          </div>

          {/* Slider 4: Horas Manuais Mensais */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="range-horas" className="text-ac-secondary font-medium">Horas em tarefas manuais:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-ac-editorial">
                  {horasManuais !== null ? `${horasManuais} h/mês` : "Não informado"}
                </span>
                <button
                  type="button"
                  onClick={() => setHorasManuais(horasManuais === null ? 40 : null)}
                  className="text-[10px] text-ac-muted underline hover:text-ac-champagne cursor-pointer"
                >
                  {horasManuais === null ? "Informar" : "Não sei"}
                </button>
              </div>
            </div>
            {horasManuais !== null && (
              <input
                id="range-horas"
                type="range"
                min="5"
                max="300"
                step="5"
                value={horasManuais}
                onChange={(e) => setHorasManuais(Number(e.target.value))}
                className="w-full"
              />
            )}
          </div>
        </div>

        {/* Lado Direito: Seletor de Cenários e Métricas Projetadas */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {/* Seletor dos 3 Cenários */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-ac-secondary font-semibold">
                Escolha um cenário:
              </span>
              <span className="text-[11px] text-ac-muted font-mono">Estimativa, não garantia</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {(["Conservador", "Base", "Expansão"] as const).map((scen) => (
                <button
                  key={scen}
                  type="button"
                  onClick={() => setActiveScenario(scen)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    activeScenario === scen
                      ? "bg-ac-surface border-ac-champagne shadow-ac-glow"
                      : "bg-ac-surface/40 border-ac-border hover:bg-ac-surface hover:border-ac-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-ac-editorial">{rotuloCenario(scen)}</span>
                    {activeScenario === scen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-ac-champagne" />
                    )}
                  </div>
                  <span className="text-[11px] text-ac-secondary block">
                    {scen === "Conservador" && "Hipótese: conversão +20%"}
                    {scen === "Base" && "Hipótese: conversão +45%"}
                    {scen === "Expansão" && "Hipótese: conversão +75%"}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-ac-secondary italic leading-relaxed mb-6 bg-ac-surface/30 p-3 rounded-lg border border-ac-border/60">
              "{cenarioAtualObj.descricao}"
            </p>

            {/* Comparativo: Situação Atual vs Cenário Selecionado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Atual */}
              <div className="p-4 rounded-xl bg-ac-surface/80 border border-ac-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ac-secondary">
                    Hoje você vende (estimado)
                  </span>
                  {getStatusBadge(simulacao.receitaAtualMensal.status)}
                </div>
                <div className="text-2xl font-black text-ac-editorial tracking-tight mb-1">
                  {simulacao.podeCalcularReceita
                    ? formatBRL(simulacao.receitaAtualMensal.valor)
                    : "Faltam números"}
                </div>
                <span className="text-[11px] text-ac-muted block">
                  Conversão hoje: {taxaConversaoAtual !== null ? `${(taxaConversaoAtual * 100).toFixed(1)}%` : "N/D"}
                </span>
              </div>

              {/* Card Simulado */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-ac-surface to-ac-surface/90 border border-ac-champagne/40 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ac-champagne font-bold">
                    Com o processo ajustado ({rotuloCenario(activeScenario)})
                  </span>
                  {getStatusBadge(cenarioAtualObj.receitaSimuladaMensal.status)}
                </div>
                <div className="text-2xl font-black text-ac-champagne tracking-tight mb-1">
                  {simulacao.podeCalcularReceita
                    ? formatBRL(cenarioAtualObj.receitaSimuladaMensal.valor)
                    : "Faltam números"}
                </div>
                <span className="text-[11px] text-emerald-400 font-mono block">
                  Conversão neste cenário: {cenarioAtualObj.taxaConversaoSimulada.valor}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 3 Alavancas de Retorno Econômico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-ac-border">
        {/* Bloco 1: Receita Incremental Bruta */}
        <div className="bg-ac-surface p-5 rounded-xl border border-ac-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ac-champagne font-bold">
                Perda em vendas
              </span>
              {getStatusBadge(cenarioAtualObj.receitaIncrementalBrutaMensal.status)}
            </div>
            <h4 className="text-xs font-semibold text-ac-secondary mb-1">Venda que escapa</h4>
            <div className="text-2xl font-extrabold text-ac-editorial mb-2">
              {simulacao.podeCalcularReceita
                ? formatBRL(cenarioAtualObj.receitaIncrementalBrutaMensal.valor)
                : "A confirmar"}
              <span className="text-xs font-normal text-ac-muted"> /mês</span>
            </div>
            <p className="text-[11px] text-ac-secondary leading-relaxed">
              Diferença entre o que você vende hoje e o que venderia com o processo ajustado.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-ac-border/60 text-[10px] text-ac-muted font-mono">
            {cenarioAtualObj.margemIncrementalMensal.valor !== null
              ? "Valor de venda, antes de descontar custos"
              : "Margem a confirmar"}
          </div>
        </div>

        {/* Bloco 2: Capacidade Operacional Liberada (Em Horas!) */}
        <div className="bg-ac-surface p-5 rounded-xl border border-ac-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                Perda em produtividade
              </span>
              {getStatusBadge(cenarioAtualObj.capacidadeLiberadaHorasMensais.status)}
            </div>
            <h4 className="text-xs font-semibold text-ac-secondary mb-1">Tempo perdido</h4>
            <div className="text-2xl font-extrabold text-ac-editorial mb-2">
              {simulacao.podeCalcularCapacidade
                ? `${cenarioAtualObj.capacidadeLiberadaHorasMensais.valor} horas`
                : "A confirmar"}
              <span className="text-xs font-normal text-ac-muted"> /mês</span>
            </div>
            <p className="text-[11px] text-ac-secondary leading-relaxed">
              Horas por mês que a equipe gasta em tarefas que poderiam ser automáticas.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-ac-border/60 text-[10px] text-ac-muted font-mono">
            {cenarioAtualObj.economiaCustoEfetivoMensal.valor !== null
              ? `Economia direta estimada: ${formatBRL(cenarioAtualObj.economiaCustoEfetivoMensal.valor)}`
              : "Sem economia direta considerada"}
          </div>
        </div>

        {/* Bloco 3: Investimento sob medida */}
        <div className="bg-ac-surface p-5 rounded-xl border border-ac-champagne/40 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-ac-gold font-bold block mb-2">
              Próximo passo
            </span>
            <h4 className="text-xs font-semibold text-ac-secondary mb-1">Como recuperar isso</h4>
            <p className="text-sm text-ac-editorial leading-relaxed">
              O caminho depende da sua operação. Em uma conversa de 45 minutos a gente mostra por onde começar e o que recuperar primeiro.
            </p>
          </div>
          <a
            href={`https://wa.me/5514991241181?text=${encodeURIComponent(
              `Olá! Vi o diagnóstico da ${empresaNome} e quero marcar uma reunião para entender como recuperar isso.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ac-champagne text-[#0B0C0D] text-xs font-bold hover:brightness-110 transition print:hidden"
          >
            Marcar reunião
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Projeção de 12 Meses */}
      <div className="mt-6 pt-6 border-t border-ac-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-ac-surface/70 p-4 rounded-xl border border-ac-border">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ac-secondary block mb-1">
              Lucro que escapa por mês
            </span>
            <div className="text-lg sm:text-xl font-black text-ac-editorial">
              {cenarioAtualObj.margemIncrementalMensal.valor !== null && cenarioAtualObj.margemIncrementalMensal.valor !== undefined
                ? formatBRL(cenarioAtualObj.margemIncrementalMensal.valor)
                : "A confirmar"}
              <span className="text-[10px] font-normal text-ac-muted"> /mês</span>
            </div>
            <span className="text-[10px] text-ac-muted block mt-1">Venda que escapa vezes a margem</span>
          </div>

          <div className="bg-ac-surface/70 p-4 rounded-xl border border-ac-champagne/40 bg-ac-champagne/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ac-champagne block mb-1 font-bold">
              Em 12 meses, deixa na mesa
            </span>
            <div className="text-lg sm:text-xl font-black text-ac-champagne">
              {cenarioAtualObj.beneficioEconomico12Meses?.valor !== null && cenarioAtualObj.beneficioEconomico12Meses?.valor !== undefined
                ? formatBRL(cenarioAtualObj.beneficioEconomico12Meses.valor)
                : "A confirmar"}
            </div>
            <span className="text-[10px] text-ac-muted block mt-1">Lucro que deixa de entrar neste cenário</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-ac-surface/40 border border-ac-border/60 flex items-center gap-2 text-[11px] text-ac-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-ac-gold shrink-0" />
          <span>
            <strong>Simulação, não promessa.</strong> Os percentuais de melhora são hipóteses de trabalho, validadas na reunião. Margem de {margemContribuicao !== null ? Math.round(margemContribuicao * 100) : "—"}% considerada.
          </span>
        </div>
      </div>
    </div>
  );
};
