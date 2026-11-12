import { 
  simularImpactoFinanceiro, 
  calcularReceitaMensal, 
  calcularReceitaIncremental, 
  calcularCapacidadeLiberada,
  calcularPaybackRampUp,
  executarTesteDidaticoMatematico,
  executarTesteDidaticoCompleto,
  FIXTURE_ESPACO_UNOA
} from '../financialEngine.ts';
import type { CommercialEconomicInputs, OperationalEconomicInputs } from '../financialEngine.ts';
import { executarDiagnosticoEstruturado } from '../diagnostic.ts';

declare const process: { exitCode?: number };

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: unknown) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`, details || '');
    process.exitCode = 1;
  }
}

console.log('=====================================================');
console.log('🧪 SUÍTE DE TESTES: AC FINANCIAL IMPACT & DIAGNOSTIC ENGINE');
console.log('=====================================================\n');

// 1. TESTE MATEMÁTICO DIDÁTICO OBRIGATÓRIO (Item 13)
// 100 leads × 20% × R$ 180 = R$ 3.600
// 100 leads × 25% × R$ 180 = R$ 4.500
// Diferença: R$ 900 de receita bruta mensal simulada.
{
  const r1 = calcularReceitaMensal(100, 0.20, 180);
  const r2 = calcularReceitaMensal(100, 0.25, 180);
  const diff = calcularReceitaIncremental(r2, r1);
  const testeAuto = executarTesteDidaticoMatematico();

  assert(r1 === 3600, 'Teste Didático: 100 leads × 20% × R$ 180 = R$ 3.600', { r1 });
  assert(r2 === 4500, 'Teste Didático: 100 leads × 25% × R$ 180 = R$ 4.500', { r2 });
  assert(diff === 900, 'Teste Didático: Diferença = R$ 900 de receita incremental mensal', { diff });
  assert(testeAuto.validado === true, 'Teste Didático: Função executarTesteDidaticoMatematico() validada');

  // Testando com simularImpactoFinanceiro diretamente
  const comercialDidatico: CommercialEconomicInputs = {
    leadsMensais: 100,
    taxaConversaoAtual: 0.20,
    ticketMedio: 180,
    tempoPrimeiraRespostaHoras: 2,
    possuiFollowUpEstruturado: true,
    agendamentosMensais: 20,
    margemContribuicao: 0.50
  };
  const operacionalDummy: OperationalEconomicInputs = {
    horasManuaisMensais: 40,
    processosRepetitivosContagem: 2,
    tempoMedioExecucaoMinutos: 20,
    taxaRetrabalho: 5,
    custoHoraHomem: 40,
    capacidadeAtendimentoMensal: 100
  };

  const simDidatica = simularImpactoFinanceiro(comercialDidatico, operacionalDummy, "converter_receita", 5000, 500);
  assert(simDidatica.podeCalcularReceita === true, 'Simulação Didática: podeCalcularReceita === true');
  assert(simDidatica.receitaAtualMensal.valor === 3600, 'Simulação Didática: receitaAtualMensal === R$ 3.600');
  assert(simDidatica.cenarios.base.receitaSimuladaMensal.valor > 3600, 'Simulação Didática: receitaSimuladaBase > R$ 3.600');
}

// 1.1 TESTE DIDÁTICO COMPLETO (Seção F do Comando):
// 200 leads, 10% atual, 12% simulado, ticket 1000, margem 50%, implantação 4000, mensalidade 1000
// Atual: 20k, Simulado: 24k, Incremental: 4k, Margem: 2k, Ganho líq: 1k, Payback: 4m, Benefício 12m: 24k, Investimento: 16k, Benefício líq: 8k, ROI: 50%
{
  const didaticoCompleto = executarTesteDidaticoCompleto();
  assert(didaticoCompleto.validado === true, 'Teste Didático Seção F: Validação matemática completa (todos os valores conformes)');
  assert(didaticoCompleto.receitaAtual === 20000, 'Teste Didático Seção F: Receita Atual = R$ 20.000');
  assert(didaticoCompleto.receitaSimulada === 24000, 'Teste Didático Seção F: Receita Simulada = R$ 24.000');
  assert(didaticoCompleto.receitaIncremental === 4000, 'Teste Didático Seção F: Receita Incremental = R$ 4.000');
  assert(didaticoCompleto.margemIncremental === 2000, 'Teste Didático Seção F: Margem Incremental = R$ 2.000');
  assert(didaticoCompleto.ganhoLiquidoMensal === 1000, 'Teste Didático Seção F: Ganho Líquido Mensal = R$ 1.000');
  assert(didaticoCompleto.paybackMeses === 4, 'Teste Didático Seção F: Payback Simples = 4 meses');
  assert(didaticoCompleto.beneficio12Meses === 24000, 'Teste Didático Seção F: Benefício 12 Meses = R$ 24.000');
  assert(didaticoCompleto.investimento12Meses === 16000, 'Teste Didático Seção F: Investimento 12 Meses = R$ 16.000');
  assert(didaticoCompleto.beneficioLiquidoAnual === 8000, 'Teste Didático Seção F: Benefício Líquido Anual = R$ 8.000');
  assert(didaticoCompleto.roiAnual === 50, 'Teste Didático Seção F: ROI Anual Estimado = 50%');

  // Teste de Payback com Ramp-Up
  const paybackRampUp = calcularPaybackRampUp(4000, 2000, 1000);
  assert(typeof paybackRampUp === 'number' && paybackRampUp > 0, 'Teste Ramp-Up: Payback com curva de maturação calculado com sucesso', { paybackRampUp });
}

// 2. TESTE CASO ESPAÇO UNOA (Item 9 & 6: Dados insuficientes para ROI)
{
  const simUnoa = simularImpactoFinanceiro(
    FIXTURE_ESPACO_UNOA.comercial,
    FIXTURE_ESPACO_UNOA.operacional,
    "converter_receita"
  );

  assert(simUnoa.podeCalcularReceita === false, 'Espaço UNOA: podeCalcularReceita deve ser falso (sem leads/ticket)');
  assert(simUnoa.cenarios.base.retornoDemonstrado === false, 'Espaço UNOA: retornoDemonstrado deve ser false');
  assert(
    simUnoa.cenarios.base.mensagemRetorno.includes('Retorno financeiro ainda não demonstrado. Precisamos validar os indicadores necessários.'),
    'Espaço UNOA: Exibe exatamente a mensagem mandatória de retorno não demonstrado'
  );
  assert(simUnoa.cenarios.base.paybackMeses.valor === null, 'Espaço UNOA: Payback deve ser null sem dados para calcular');
  assert(simUnoa.dadosAusentes.length > 0, 'Espaço UNOA: Lista campos ausentes para orientar a sessão de validação', simUnoa.dadosAusentes);
}

// 3. TESTE DE CAPACIDADE LIBERADA VS REDUÇÃO DE CUSTO (Item 6)
// Horas manuais liberadas devem ser apresentadas como horas, e NÃO como redução de custo sem custo-hora informado
{
  const cap = calcularCapacidadeLiberada(100, 70);
  assert(cap === 30, 'Capacidade Liberada: 100h atuais - 70h projetadas = 30h liberadas');

  const comercialVazio: CommercialEconomicInputs = {
    leadsMensais: null,
    taxaConversaoAtual: null,
    ticketMedio: null,
    tempoPrimeiraRespostaHoras: null,
    possuiFollowUpEstruturado: null,
    agendamentosMensais: null,
    margemContribuicao: null,
  };
  const opSemCustoHora: OperationalEconomicInputs = {
    horasManuaisMensais: 80,
    processosRepetitivosContagem: 3,
    tempoMedioExecucaoMinutos: 45,
    taxaRetrabalho: null,
    custoHoraHomem: null, // SEM CUSTO HORA INFORMADO
    capacidadeAtendimentoMensal: null,
  };

  const simOp = simularImpactoFinanceiro(comercialVazio, opSemCustoHora, "reduzir_custos");
  assert(simOp.podeCalcularCapacidade === true, 'Operações: podeCalcularCapacidade é true quando horas são informadas');
  assert(simOp.cenarios.base.capacidadeLiberadaHorasMensais.valor > 0, 'Operações: Horas liberadas calculadas');
  assert(simOp.cenarios.base.economiaCustoEfetivoMensal.valor === null, 'Operações: Custo financeiro NÃO reconhecido sem taxa horária informada');
}

// 4. TESTE DE 3 CENÁRIOS (Conservador < Base < Expansão)
{
  const comercial3C: CommercialEconomicInputs = {
    leadsMensais: 200,
    taxaConversaoAtual: 0.10,
    ticketMedio: 500,
    tempoPrimeiraRespostaHoras: 1,
    possuiFollowUpEstruturado: true,
    agendamentosMensais: 20,
    margemContribuicao: 0.40,
  };
  const op3C: OperationalEconomicInputs = {
    horasManuaisMensais: 120,
    processosRepetitivosContagem: 5,
    tempoMedioExecucaoMinutos: 30,
    taxaRetrabalho: 10,
    custoHoraHomem: 50,
    capacidadeAtendimentoMensal: 300,
  };

  const sim3C = simularImpactoFinanceiro(comercial3C, op3C, "converter_receita", 8000, 800);
  const recCons = sim3C.cenarios.conservador.receitaIncrementalBrutaMensal.valor;
  const recBase = sim3C.cenarios.base.receitaIncrementalBrutaMensal.valor;
  const recExp = sim3C.cenarios.expansao.receitaIncrementalBrutaMensal.valor;

  assert(recCons < recBase, '3 Cenários: Receita Incremental Conservador < Base', { recCons, recBase });
  assert(recBase < recExp, '3 Cenários: Receita Incremental Base < Expansão', { recBase, recExp });
  assert(sim3C.cenarios.base.retornoDemonstrado === true, '3 Cenários: Retorno demonstrado quando temos investimento e benefícios');
  assert(typeof sim3C.cenarios.base.paybackMeses.valor === 'number', '3 Cenários: Payback numérico calculado', sim3C.cenarios.base.paybackMeses.valor);
}

// 5. TESTE DO MOTOR DE DIAGNÓSTICO ESTRUTURADO (Item 5)
{
  const diagComercial = executarDiagnosticoEstruturado(
    'comercial',
    'servicos',
    'serv_com_1',
    'dispersos',
    'Empresa Teste Alpha'
  );

  assert(diagComercial.alavancaPrioritaria === 'converter_receita', 'Diagnóstico Modular: Alavanca Comercial classificada como "converter_receita"');
  assert(diagComercial.arquiteturaRecomendada.pilares.length === 3, 'Diagnóstico Modular: 3 pilares AC (Cérebro, Agentes, Tração) presentes');
  assert(diagComercial.roadmapEstimadoFases.length === 4, 'Diagnóstico Modular: Roadmap de 90 dias com 4 fases consecutivas');
}

console.log('\n=====================================================');
console.log(`📊 RESULTADO DOS TESTES: ${passedTests} de ${totalTests} passaram com sucesso!`);
console.log('=====================================================\n');
