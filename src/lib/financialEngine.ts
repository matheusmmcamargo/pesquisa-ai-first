/**
 * AC GROWTH INTELLIGENCE — FINANCIAL IMPACT ENGINE
 * 
 * Motor de modelagem financeira, controladoria e simulação de cenários FP&A.
 * 
 * DIRETRIZES DE AUDITORIA:
 * 1. Todos os cálculos partem estritamente de dados informados ou de hipóteses explícitas.
 * 2. Horas manuais liberadas são apresentadas como "Capacidade Operacional Liberada",
 *    e NÃO como redução de custo financeiro imediato (a menos que haja despesa efetivamente eliminada).
 * 3. Se faltarem dados de baseline (leads, conversão ou ticket), o sistema não inventa números,
 *    e declara expressamente: "Retorno financeiro ainda não demonstrado. Precisamos validar os indicadores necessários."
 */

export type MetricStatus = "INFORMADO" | "CALCULADO" | "SIMULADO" | "A_MEDIR";

export interface MetricDefinition<T = number | string> {
  valor: T;
  unidade: string;
  periodo: "mensal" | "anual" | "único" | "por evento";
  status: MetricStatus;
  formula?: string;
  premissa?: string;
  rotulo: string;
}

export interface CommercialEconomicInputs {
  leadsMensais: number | null; // null = não informado
  taxaConversaoAtual: number | null; // % (ex: 0.05 para 5%)
  ticketMedio: number | null; // R$
  tempoPrimeiraRespostaHoras: number | null;
  possuiFollowUpEstruturado: boolean | null;
  agendamentosMensais: number | null;
  margemContribuicao: number | null; // % (ex: 0.40 para 40%)
}

export interface OperationalEconomicInputs {
  horasManuaisMensais: number | null; // horas/mês
  processosRepetitivosContagem: number | null;
  tempoMedioExecucaoMinutos: number | null;
  taxaRetrabalho: number | null; // %
  custoHoraHomem: number | null; // R$/hora (se conhecido)
  capacidadeAtendimentoMensal: number | null;
}

export interface PurchasingEconomicInputs {
  volumeComprasMensais: number | null; // R$/mês
  pedidosCotacoesMensais: number | null; // qtd
  custoProcessoPorPedido: number | null; // R$
  tempoMedioAprovacaoDias: number | null;
  taxaDivergenciasRetrabalho: number | null; // %
  despesasEvitaveisComprovadas: number | null; // R$
}

export interface FinancialScenarioResult {
  nome: "Conservador" | "Base" | "Expansão";
  descricao: string;
  // Comercial
  taxaConversaoSimulada: MetricDefinition<number>;
  receitaSimuladaMensal: MetricDefinition<number>;
  receitaIncrementalBrutaMensal: MetricDefinition<number>;
  margemIncrementalMensal: MetricDefinition<number | null>;
  // Operacional
  horasManuaisProjetadasMensais: MetricDefinition<number>;
  capacidadeLiberadaHorasMensais: MetricDefinition<number>;
  economiaCustoEfetivoMensal: MetricDefinition<number | null>;
  // Retorno Geral & 12 Meses (Seção F)
  ganhoMensalLiquidoIncremental: MetricDefinition<number | null>;
  investimentoTotal12Meses: MetricDefinition<number | null>;
  beneficioEconomico12Meses: MetricDefinition<number | null>;
  beneficioLiquidoAnual: MetricDefinition<number | null>;
  roiAnualEstimado: MetricDefinition<number | null>;
  investimentoEstimado: MetricDefinition<number | null>;
  paybackMeses: MetricDefinition<number | null>;
  paybackAcumuladoRampUpMeses: MetricDefinition<number | null>;
  retornoDemonstrado: boolean;
  mensagemRetorno: string;
}

export interface FinancialSimulationSummary {
  podeCalcularReceita: boolean;
  podeCalcularCapacidade: boolean;
  podeCalcularPayback: boolean;
  receitaAtualMensal: MetricDefinition<number | null>;
  horasManuaisAtuais: MetricDefinition<number | null>;
  dadosAusentes: string[];
  cenarios: {
    conservador: FinancialScenarioResult;
    base: FinancialScenarioResult;
    expansao: FinancialScenarioResult;
  };
  kpiContratualRecomendado: string;
  alavancaPrioritaria: "gerar_receita" | "converter_receita" | "reduzir_custos" | "aumentar_capacidade";
}

/**
 * Realiza o cálculo do modelo de receita comercial
 * 
 * Fórmula:
 * Receita = Leads × Taxa de Conversão × Ticket Médio
 */
export function calcularReceitaMensal(
  leads: number,
  taxaConversao: number,
  ticketMedio: number
): number {
  if (leads <= 0 || taxaConversao < 0 || ticketMedio <= 0) return 0;
  return leads * taxaConversao * ticketMedio;
}

/**
 * Calcula a receita incremental bruta
 * Fórmula: Receita Simulada - Receita Atual
 */
export function calcularReceitaIncremental(
  receitaSimulada: number,
  receitaAtual: number
): number {
  return Math.max(0, receitaSimulada - receitaAtual);
}

/**
 * Calcula a capacidade liberada em horas
 * Fórmula: Horas Atuais - Horas Projetadas
 */
export function calcularCapacidadeLiberada(
  horasAtuais: number,
  horasProjetadas: number
): number {
  return Math.max(0, horasAtuais - horasProjetadas);
}

/**
 * Calcula o payback por fluxo de caixa acumulado com curva de maturação (Ramp-Up).
 * Rampa padrão de 4 meses: Mês 1: 30%, Mês 2: 60%, Mês 3: 85%, Mês 4+: 100%.
 */
export function calcularPaybackRampUp(
  investimentoInicial: number,
  beneficioMensalPleno: number,
  custoMensal: number,
  fatoresRampUp: number[] = [0.3, 0.6, 0.85, 1.0]
): number | null {
  if (investimentoInicial <= 0 || beneficioMensalPleno <= custoMensal) return null;
  let saldoDevedor = investimentoInicial;
  for (let mes = 1; mes <= 36; mes++) {
    const fator = mes <= fatoresRampUp.length ? fatoresRampUp[mes - 1] : 1.0;
    const fluxoLiquidoMes = (beneficioMensalPleno * fator) - custoMensal;
    if (fluxoLiquidoMes > 0) {
      if (saldoDevedor <= fluxoLiquidoMes) {
        const fracao = saldoDevedor / fluxoLiquidoMes;
        return Number(((mes - 1) + fracao).toFixed(1));
      }
      saldoDevedor -= fluxoLiquidoMes;
    }
  }
  return null;
}

/**
 * Executa a simulação completa sob os 3 cenários
 */
export function simularImpactoFinanceiro(
  comercial: CommercialEconomicInputs,
  operacional: OperationalEconomicInputs,
  alavanca: "gerar_receita" | "converter_receita" | "reduzir_custos" | "aumentar_capacidade" = "converter_receita",
  investimentoEstimadoImplantacao: number | null = null,
  mensalidadeEstimada: number | null = null
): FinancialSimulationSummary {
  const dadosAusentes: string[] = [];

  const temLeads = comercial.leadsMensais !== null && comercial.leadsMensais > 0;
  const temConversao = comercial.taxaConversaoAtual !== null && comercial.taxaConversaoAtual >= 0;
  const temTicket = comercial.ticketMedio !== null && comercial.ticketMedio > 0;

  if (!temLeads) dadosAusentes.push("Volume de leads mensais recebidos");
  if (!temConversao) dadosAusentes.push("Taxa atual de conversão comercial");
  if (!temTicket) dadosAusentes.push("Ticket médio de contratação / venda");

  const temHoras = operacional.horasManuaisMensais !== null && operacional.horasManuaisMensais > 0;
  if (!temHoras) dadosAusentes.push("Horas mensais consumidas em rotinas operacionais");

  const podeCalcularReceita = temLeads && temConversao && temTicket;
  const podeCalcularCapacidade = temHoras;

  // Situação Atual
  const receitaAtualValor = podeCalcularReceita
    ? calcularReceitaMensal(
        comercial.leadsMensais!,
        comercial.taxaConversaoAtual!,
        comercial.ticketMedio!
      )
    : null;

  const receitaAtualMetric: MetricDefinition<number | null> = {
    valor: receitaAtualValor,
    unidade: "BRL",
    periodo: "mensal",
    status: podeCalcularReceita ? "CALCULADO" : "A_MEDIR",
    formula: podeCalcularReceita ? "Leads × Taxa Atual × Ticket Médio" : undefined,
    premissa: "Informado pelo cliente no diagnóstico preliminar.",
    rotulo: "Receita Comercial Atual Estimada",
  };

  const horasAtuaisMetric: MetricDefinition<number | null> = {
    valor: operacional.horasManuaisMensais,
    unidade: "horas",
    periodo: "mensal",
    status: temHoras ? "INFORMADO" : "A_MEDIR",
    rotulo: "Horas Mensais Dedicadas a Tarefas Manuais",
  };

  // Taxas e ganhos de cada cenário
  // Cenário Conservador: ganho relativo de +20% na conversão (ou mínimo de +1.5 p.p.)
  // Cenário Base: ganho relativo de +40% na conversão (ou mínimo de +3 p.p.)
  // Cenário Expansão: ganho relativo de +75% na conversão (ou mínimo de +5.5 p.p.)
  const taxaAtual = comercial.taxaConversaoAtual ?? 0.05;
  const leads = comercial.leadsMensais ?? 0;
  const ticket = comercial.ticketMedio ?? 0;
  const margem = comercial.margemContribuicao; // se não houver, margem fica null
  const horasAtuais = operacional.horasManuaisMensais ?? 0;

  const gerarCenario = (
    nome: "Conservador" | "Base" | "Expansão",
    fatorConversaoRelativo: number,
    fatorReducaoHoras: number,
    descricao: string
  ): FinancialScenarioResult => {
    const taxaSimulada = Math.min(0.95, taxaAtual * (1 + fatorConversaoRelativo));
    const receitaSimulada = podeCalcularReceita ? calcularReceitaMensal(leads, taxaSimulada, ticket) : 0;
    const receitaIncremental = podeCalcularReceita ? calcularReceitaIncremental(receitaSimulada, receitaAtualValor || 0) : 0;
    const margemIncremental = margem !== null && podeCalcularReceita ? receitaIncremental * margem : null;

    const horasProjetadas = podeCalcularCapacidade ? Math.round(horasAtuais * (1 - fatorReducaoHoras)) : 0;
    const capacidadeLiberada = podeCalcularCapacidade ? calcularCapacidadeLiberada(horasAtuais, horasProjetadas) : 0;

    // Redução de custo só é reconhecida se houver custoHoraHomem informado E se houver eliminação real
    const economiaCusto =
      operacional.custoHoraHomem !== null && podeCalcularCapacidade
        ? capacidadeLiberada * operacional.custoHoraHomem
        : null;

    // Payback
    const beneficioMensal = (margemIncremental || receitaIncremental * 0.35) + (economiaCusto || 0);
    const temInvestimento = investimentoEstimadoImplantacao !== null && investimentoEstimadoImplantacao > 0;
    const temBeneficio = beneficioMensal > 0;

    let paybackMesesValor: number | null = null;
    let retornoDemonstrado: boolean;
    let mensagemRetorno: string;

    const custoMensal = mensalidadeEstimada || 0;
    const ganhoLiquidoMensal = beneficioMensal - custoMensal;

    if (podeCalcularReceita && temInvestimento && temBeneficio) {
      if (ganhoLiquidoMensal > 0) {
        paybackMesesValor = Number((investimentoEstimadoImplantacao! / ganhoLiquidoMensal).toFixed(1));
        retornoDemonstrado = true;
        mensagemRetorno = `Payback estimado em ${paybackMesesValor} meses sob as premissas deste cenário.`;
      } else {
        retornoDemonstrado = false;
        mensagemRetorno = "Neste cenário o benefício líquido mensal não supera os custos recorrentes.";
      }
    } else {
      retornoDemonstrado = false;
      mensagemRetorno = "Retorno financeiro ainda não demonstrado. Precisamos validar os indicadores necessários.";
    }

    // Cálculos de 12 Meses e ROI (Seção F do comando)
    const ganhoLiquidoMensalCalculado = margemIncremental !== null ? (margemIncremental - custoMensal) : null;
    const investimento12m = temInvestimento ? (investimentoEstimadoImplantacao! + (12 * custoMensal)) : null;
    const beneficio12m = margemIncremental !== null ? (12 * margemIncremental) : null;
    const beneficioLiquido12m = (beneficio12m !== null && investimento12m !== null)
      ? (beneficio12m - investimento12m)
      : null;
    const roi12m = (beneficioLiquido12m !== null && investimento12m !== null && investimento12m > 0)
      ? Number(((beneficioLiquido12m / investimento12m) * 100).toFixed(1))
      : null;
    const paybackRampUpCalculado = (temInvestimento && beneficioMensal > custoMensal)
      ? calcularPaybackRampUp(investimentoEstimadoImplantacao!, beneficioMensal, custoMensal)
      : null;

    return {
      nome,
      descricao,
      taxaConversaoSimulada: {
        valor: Number((taxaSimulada * 100).toFixed(1)),
        unidade: "%",
        periodo: "mensal",
        status: "SIMULADO",
        formula: `Taxa Atual (${(taxaAtual * 100).toFixed(1)}%) × ${(1 + fatorConversaoRelativo).toFixed(2)}`,
        premissa: `Hipótese de melhoria de +${Math.round(fatorConversaoRelativo * 100)}% na resposta rápida e cadência ativa.`,
        rotulo: `Taxa de Conversão — Cenário ${nome}`,
      },
      receitaSimuladaMensal: {
        valor: Math.round(receitaSimulada),
        unidade: "BRL",
        periodo: "mensal",
        status: podeCalcularReceita ? "SIMULADO" : "A_MEDIR",
        formula: "Leads × Taxa Simulada × Ticket Médio",
        rotulo: `Receita Mensal Projetada — ${nome}`,
      },
      receitaIncrementalBrutaMensal: {
        valor: Math.round(receitaIncremental),
        unidade: "BRL",
        periodo: "mensal",
        status: podeCalcularReceita ? "SIMULADO" : "A_MEDIR",
        formula: "Receita Simulada − Receita Atual",
        rotulo: `Ganho Bruto Incremental — ${nome}`,
      },
      margemIncrementalMensal: {
        valor: margemIncremental !== null ? Math.round(margemIncremental) : null,
        unidade: "BRL",
        periodo: "mensal",
        status: margemIncremental !== null ? "SIMULADO" : "A_MEDIR",
        formula: margem !== null ? `Receita Incremental × Margem (${(margem * 100).toFixed(0)}%)` : "Requer margem de contribuição",
        rotulo: `Margem de Contribuição Incremental — ${nome}`,
      },
      horasManuaisProjetadasMensais: {
        valor: horasProjetadas,
        unidade: "horas",
        periodo: "mensal",
        status: podeCalcularCapacidade ? "SIMULADO" : "A_MEDIR",
        formula: `Horas Atuais × ${(1 - fatorReducaoHoras).toFixed(2)}`,
        rotulo: "Horas Manuais Projetadas",
      },
      capacidadeLiberadaHorasMensais: {
        valor: capacidadeLiberada,
        unidade: "horas",
        periodo: "mensal",
        status: podeCalcularCapacidade ? "SIMULADO" : "A_MEDIR",
        formula: "Horas Atuais − Horas Projetadas",
        rotulo: "Capacidade Operacional Liberada",
      },
      economiaCustoEfetivoMensal: {
        valor: economiaCusto !== null ? Math.round(economiaCusto) : null,
        unidade: "BRL",
        periodo: "mensal",
        status: economiaCusto !== null ? "SIMULADO" : "A_MEDIR",
        formula: "Horas Liberadas × Custo-Hora Homem (apenas se houver despesa desmobilizada)",
        rotulo: "Economia Efetiva de Custos",
      },
      investimentoEstimado: {
        valor: investimentoEstimadoImplantacao,
        unidade: "BRL",
        periodo: "único",
        status: temInvestimento ? "SIMULADO" : "A_MEDIR",
        rotulo: "Investimento de Implantação e Arquitetura",
      },
      ganhoMensalLiquidoIncremental: {
        valor: ganhoLiquidoMensalCalculado !== null ? Math.round(ganhoLiquidoMensalCalculado) : null,
        unidade: "BRL",
        periodo: "mensal",
        status: ganhoLiquidoMensalCalculado !== null ? "CALCULADO" : "A_MEDIR",
        formula: "Margem Incremental − Custos Recorrentes Mensais",
        rotulo: "Ganho Mensal Líquido Incremental",
      },
      investimentoTotal12Meses: {
        valor: investimento12m,
        unidade: "BRL",
        periodo: "anual",
        status: investimento12m !== null ? "CALCULADO" : "A_MEDIR",
        formula: "Implantação + (12 × Mensalidade)",
        rotulo: "Investimento Total Projetado (12 Meses)",
      },
      beneficioEconomico12Meses: {
        valor: beneficio12m !== null ? Math.round(beneficio12m) : null,
        unidade: "BRL",
        periodo: "anual",
        status: beneficio12m !== null ? "SIMULADO" : "A_MEDIR",
        formula: "12 × Margem Incremental Mensal",
        rotulo: "Benefício Econômico Bruto (12 Meses)",
      },
      beneficioLiquidoAnual: {
        valor: beneficioLiquido12m !== null ? Math.round(beneficioLiquido12m) : null,
        unidade: "BRL",
        periodo: "anual",
        status: beneficioLiquido12m !== null ? "CALCULADO" : "A_MEDIR",
        formula: "Benefício Econômico 12m − Investimento Total 12m",
        rotulo: "Benefício Líquido Projetado em 12 Meses",
      },
      roiAnualEstimado: {
        valor: roi12m,
        unidade: "%",
        periodo: "anual",
        status: roi12m !== null ? "CALCULADO" : "A_MEDIR",
        formula: "((Benefício 12m − Investimento 12m) / Investimento 12m) × 100",
        rotulo: "ROI Anual Projetado",
      },
      paybackMeses: {
        valor: paybackMesesValor,
        unidade: "meses",
        periodo: "único",
        status: retornoDemonstrado ? "CALCULADO" : "A_MEDIR",
        rotulo: "Payback Simulado do Investimento",
      },
      paybackAcumuladoRampUpMeses: {
        valor: paybackRampUpCalculado,
        unidade: "meses",
        periodo: "único",
        status: paybackRampUpCalculado !== null ? "CALCULADO" : "A_MEDIR",
        formula: "Fluxo de caixa acumulado mês a mês considerando maturação gradual",
        rotulo: "Payback com Curva de Ramp-Up",
      },
      retornoDemonstrado,
      mensagemRetorno,
    };
  };

  const conservador = gerarCenario(
    "Conservador",
    0.20,
    0.30,
    "Hipótese prudente: responder mais rápido e não deixar nenhuma oportunidade sem retorno."
  );

  const base = gerarCenario(
    "Base",
    0.45,
    0.55,
    "Hipótese central: responder em poucos minutos e acompanhar cada oportunidade até a decisão do cliente."
  );

  const expansao = gerarCenario(
    "Expansão",
    0.75,
    0.75,
    "Hipótese ampla: atendimento todo integrado, clientes antigos reativados e tarefas manuais quase zeradas."
  );

  // Definição do KPI Contratual Principal
  let kpiContratual = "Taxa de conversão de leads qualificados em reuniões agendadas";
  if (alavanca === "gerar_receita") {
    kpiContratual = "Volume mensal de oportunidades ICP qualificadas entregues aos executivos";
  } else if (alavanca === "reduzir_custos") {
    kpiContratual = "Horas mensais desmobilizadas em conciliação manual e custo por processo";
  } else if (alavanca === "aumentar_capacidade") {
    kpiContratual = "Tempo médio de resposta (SLA) e volume de atendimentos concluídos por colaborador";
  }

  const podeCalcularPayback = base.retornoDemonstrado;

  return {
    podeCalcularReceita,
    podeCalcularCapacidade,
    podeCalcularPayback,
    receitaAtualMensal: receitaAtualMetric,
    horasManuaisAtuais: horasAtuaisMetric,
    dadosAusentes,
    cenarios: {
      conservador,
      base,
      expansao,
    },
    kpiContratualRecomendado: kpiContratual,
    alavancaPrioritaria: alavanca,
  };
}

/**
 * Fixture de Teste Didático Oficial (Seção F do Comando Completo):
 * 200 leads/mês; conversão atual 10%; conversão simulada 12%; ticket R$ 1.000;
 * margem 50%; implantação R$ 4.000; mensalidade R$ 1.000.
 * 
 * - Atual: R$ 20.000/mês
 * - Simulado: R$ 24.000/mês
 * - Receita bruta incremental: R$ 4.000/mês
 * - Margem incremental: R$ 2.000/mês
 * - Ganho líquido mensal: R$ 1.000
 * - Payback simples de implantação: 4 meses
 * - Benefício econômico em 12 meses: R$ 24.000
 * - Investimento anual: R$ 16.000
 * - Benefício líquido anual: R$ 8.000
 * - ROI anual: 50%
 * Rotulado: "Exemplo ilustrativo para demonstrar a matemática; não representa resultado real ou garantia."
 */
export function executarTesteDidaticoCompleto(): {
  receitaAtual: number;
  receitaSimulada: number;
  receitaIncremental: number;
  margemIncremental: number;
  ganhoLiquidoMensal: number;
  paybackMeses: number;
  beneficio12Meses: number;
  investimento12Meses: number;
  beneficioLiquidoAnual: number;
  roiAnual: number;
  validado: boolean;
} {
  const leads = 200;
  const convAtual = 0.10;
  const convSimulada = 0.12;
  const ticket = 1000;
  const margem = 0.50;
  const implantacao = 4000;
  const mensalidade = 1000;

  const receitaAtual = leads * convAtual * ticket; // 20.000
  const receitaSimulada = leads * convSimulada * ticket; // 24.000
  const receitaIncremental = receitaSimulada - receitaAtual; // 4.000
  const margemIncremental = receitaIncremental * margem; // 2.000
  const ganhoLiquidoMensal = margemIncremental - mensalidade; // 1.000
  const paybackMeses = implantacao / ganhoLiquidoMensal; // 4
  const beneficio12Meses = 12 * margemIncremental; // 24.000
  const investimento12Meses = implantacao + (12 * mensalidade); // 16.000
  const beneficioLiquidoAnual = beneficio12Meses - investimento12Meses; // 8.000
  const roiAnual = (beneficioLiquidoAnual / investimento12Meses) * 100; // 50%

  const validado = 
    receitaAtual === 20000 &&
    receitaSimulada === 24000 &&
    receitaIncremental === 4000 &&
    margemIncremental === 2000 &&
    ganhoLiquidoMensal === 1000 &&
    paybackMeses === 4 &&
    beneficio12Meses === 24000 &&
    investimento12Meses === 16000 &&
    beneficioLiquidoAnual === 8000 &&
    roiAnual === 50;

  return {
    receitaAtual,
    receitaSimulada,
    receitaIncremental,
    margemIncremental,
    ganhoLiquidoMensal,
    paybackMeses,
    beneficio12Meses,
    investimento12Meses,
    beneficioLiquidoAnual,
    roiAnual,
    validado
  };
}

/**
 * Fixture de Teste Didático Obrigatório (Item 13 do Comando Mestre):
 * 100 leads × 20% × R$ 180 = R$ 3.600
 * 100 leads × 25% × R$ 180 = R$ 4.500
 * Diferença: R$ 900 de receita bruta mensal simulada.
 */
export function executarTesteDidaticoMatematico(): {
  receitaOriginal: number;
  receitaSimulada: number;
  diferenca: number;
  validado: boolean;
} {
  const receitaOriginal = calcularReceitaMensal(100, 0.20, 180); // 3600
  const receitaSimulada = calcularReceitaMensal(100, 0.25, 180); // 4500
  const diferenca = calcularReceitaIncremental(receitaSimulada, receitaOriginal); // 900
  return {
    receitaOriginal,
    receitaSimulada,
    diferenca,
    validado: receitaOriginal === 3600 && receitaSimulada === 4500 && diferenca === 900,
  };
}

/**
 * Fixture de Teste do Caso Espaço UNOA (Item 9 do Comando Mestre):
 * Empresa de terapias integrativas com processos manuais, dados fragmentados
 * e ausência de dados quantitativos suficientes para cálculo de ROI.
 * DEVE resultar em "retornoDemonstrado: false".
 */
export const FIXTURE_ESPACO_UNOA = {
  empresa: "Espaço UNOA",
  segmento: "Terapias Integrativas & Bem-Estar",
  cidade: "Sorocaba / SP",
  contexto: "Operação predominantemente manual, dados fragmentados e ausência de indicadores gerenciais em tempo real.",
  gargalo: "Decisões e rotinas administrativas dependentes de anotações manuais e WhatsApp sem histórico estruturado.",
  comercial: {
    leadsMensais: null,
    taxaConversaoAtual: null,
    ticketMedio: null,
    tempoPrimeiraRespostaHoras: 4,
    possuiFollowUpEstruturado: false,
    agendamentosMensais: null,
    margemContribuicao: null,
  } as CommercialEconomicInputs,
  operacional: {
    horasManuaisMensais: 60, // 60h/mês gastas em controle de agenda e rotinas
    processosRepetitivosContagem: 4,
    tempoMedioExecucaoMinutos: 30,
    taxaRetrabalho: null,
    custoHoraHomem: null,
    capacidadeAtendimentoMensal: null,
  } as OperationalEconomicInputs,
  prioridadeRecomendada: "Validar as fontes de dados de agendamentos e desenhar o primeiro fluxo de confirmação e cadastro com impacto mensurável.",
};
