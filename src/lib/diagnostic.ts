/**
 * AC GROWTH INTELLIGENCE — DIAGNOSTIC ENGINE
 * 
 * Motor analítico de diagnóstico operacional, mapeamento de gargalos e
 * arquitetura tecnológica recomendada.
 * 
 * NOTA DE TRANSPARÊNCIA METODOLÓGICA:
 * As análises e hipóteses geradas por este motor decorrem de regras algorítmicas
 * e matrizes de decisão estruturadas da Agência Camargo (framework Growth Engineering).
 * Não constituem parecer contábil/financeiro conclusivo nem promessa de resultado garantido;
 * representam um mapa de oportunidades preliminar para orientar a sessão de arquitetura técnica.
 */

export type AreaOption = "comercial" | "operacao" | "compras";
export type SetorOption = "servicos" | "industria" | "varejo" | "saude_bem_estar";
export type MaturidadeOption = "estruturados" | "dispersos" | "manuais";

export type AlavancaEconomica =
  | "gerar_receita"
  | "converter_receita"
  | "reduzir_custos"
  | "aumentar_capacidade";

export interface SymptomOption {
  id: string;
  title: string;
  desc: string;
  impacto: "alto" | "critico" | "moderado";
  alavanca: AlavancaEconomica;
}

export interface DynamicQuestionConfig {
  tag: string;
  pergunta: string;
  subtitulo: string;
  opcoes: SymptomOption[];
}

export interface ArchitecturePillar {
  nome: "CÉREBRO" | "AGENTES" | "TRAÇÃO";
  titulo: string;
  descricao: string;
  tecnologiasJustificadas: string[];
}

export interface DetailedDiagnosticResult {
  problemaDeclarado: string;
  causaProvavel: string;
  consequenciaEconomica: string;
  alavancaPrioritaria: AlavancaEconomica;
  alavancaDescricao: string;
  grauMaturidadeDados: {
    nivel: "Baixa (Dados Manuais)" | "Média (Dados Dispersos)" | "Alta (Dados Estruturados)";
    diagnostico: string;
    riscoPrincipal: string;
  };
  arquiteturaRecomendada: {
    titulo: string;
    pilares: ArchitecturePillar[];
    fluxoResumo: string;
    disclaimer: string;
  };
  indicadoresNecessariosParaComprovacao: string[];
  roadmapEstimadoFases: Array<{
    fase: string;
    prazoDias: string;
    objetivo: string;
    entregaveis: string[];
  }>;
}

/**
 * Matriz de perguntas dinâmicas e sintomas por Área x Setor
 */
export function getDynamicQuestion(area: AreaOption, setor: SetorOption): DynamicQuestionConfig {
  // 1. Indústria / Operações / Compras
  if (setor === "industria" && (area === "operacao" || area === "compras")) {
    return {
      tag: "Indústria & Manufatura • Compras & Suprimentos",
      pergunta: "Onde reside a maior lentidão e perda de eficiência no seu fluxo de suprimentos e produção?",
      subtitulo: "Identifique a principal fricção operacional declarada:",
      opcoes: [
        {
          id: "ind_sup_1",
          title: "Mais de 15 horas/semana por comprador em cotações e follow-up disperso por e-mail",
          desc: "Falta de centralização de orçamentos, dependência de planilhas e risco constante de sobrepreço em insumos críticos.",
          impacto: "critico",
          alavanca: "reduzir_custos",
        },
        {
          id: "ind_sup_2",
          title: "Ordens de produção atrasadas por falta de sincronização entre estoque e pedidos",
          desc: "Comunicação falha entre vendas e fábrica, gerando ociosidade ou compras emergenciais com frete expresso.",
          impacto: "alto",
          alavanca: "aumentar_capacidade",
        },
        {
          id: "ind_sup_3",
          title: "Ausência de histórico comparativo de preços e dependência de cotações reativas",
          desc: "Decisões de compra tomadas sem inteligência preditiva de preços e sem alçadas digitais de aprovação.",
          impacto: "moderado",
          alavanca: "reduzir_custos",
        },
      ],
    };
  }

  // 2. Serviços B2B / SaaS / Clínicas • Comercial
  if ((setor === "servicos" || setor === "saude_bem_estar") && area === "comercial") {
    return {
      tag: "Serviços & Operações Consultivas • Comercial & Atendimento",
      pergunta: "Qual o principal vazamento de oportunidades na sua jornada de atendimento e vendas?",
      subtitulo: "Mensure o ponto onde potenciais clientes esfriam ou desistem:",
      opcoes: [
        {
          id: "serv_com_1",
          title: "Tempo de resposta superior a 15 minutos (leads esfriam antes do primeiro contato)",
          desc: "Contatos recebidos fora do expediente ou em picos de demanda ficam horas sem triagem e procuram concorrentes.",
          impacto: "critico",
          alavanca: "converter_receita",
        },
        {
          id: "serv_com_2",
          title: "Time comercial desperdiçando tempo com contatos desqualificados e sem perfil (fora do ICP)",
          desc: "Ausência de pré-filtro inteligente; executivos seniores realizam reuniões com curiosos sem orçamento.",
          impacto: "alto",
          alavanca: "aumentar_capacidade",
        },
        {
          id: "serv_com_3",
          title: "Base de clientes inativa sem régua sistemática de reativação ou pós-venda",
          desc: "Contatos que já compraram ou demonstraram interesse são esquecidos por falta de cadência estruturada.",
          impacto: "moderado",
          alavanca: "gerar_receita",
        },
      ],
    };
  }

  // 3. Varejo / E-commerce • Comercial
  if (setor === "varejo" && area === "comercial") {
    return {
      tag: "Varejo & Canais Digitais • Vendas & Conversão",
      pergunta: "Onde está a maior perda financeira no fechamento de vendas da sua esteira?",
      subtitulo: "Selecione a dor com maior reflexo no caixa:",
      opcoes: [
        {
          id: "var_com_1",
          title: "Inexistência de recuperação ativa e imediata de carrinhos, PIX e orçamentos pendentes",
          desc: "Clientes iniciam a intenção de compra mas desistem sem que haja abordagem personalizada nos primeiros minutos.",
          impacto: "critico",
          alavanca: "converter_receita",
        },
        {
          id: "var_com_2",
          title: "Disparos genéricos sem segmentação por comportamento ou perfil financeiro",
          desc: "Comunicação em massa de baixo engajamento e erosão de margem com descontos desnecessários.",
          impacto: "alto",
          alavanca: "gerar_receita",
        },
        {
          id: "var_com_3",
          title: "Clientes compram uma única vez e não recompram (LTV estagnado)",
          desc: "Dependência excessiva de tráfego pago constante para faturar, sem esteira de recompra automática.",
          impacto: "moderado",
          alavanca: "gerar_receita",
        },
      ],
    };
  }

  // 4. Operação Geral / Serviços Integrativos
  return {
    tag: `${setor === "saude_bem_estar" ? "Saúde & Bem-Estar" : "Operações"} • Processos & Gestão`,
    pergunta: "Qual rotina manual mais consome a capacidade da sua liderança e equipe hoje?",
    subtitulo: "Identifique a principal perda de produtividade operacional:",
    opcoes: [
      {
        id: "gen_op_1",
        title: "Agendamentos, confirmações e anotações gerenciais feitos manualmente em cadernos ou WhatsApp",
        desc: "Equipe atuando como digitadora de dados; falhas de confirmação, faltas não repostas e ausência de relatórios em tempo real.",
        impacto: "critico",
        alavanca: "aumentar_capacidade",
      },
      {
        id: "gen_op_2",
        title: "Conciliação manual de dados entre planilhas, extratos e sistemas desconectados",
        desc: "Horas gastas cruzando informações para fechar caixa ou calcular indicadores básicos de desempenho.",
        impacto: "alto",
        alavanca: "reduzir_custos",
      },
      {
        id: "gen_op_3",
        title: "Falta de visibilidade da capacidade ociosa e dos gargalos por colaborador",
        desc: "Decisões de escala tomadas 'no escuro', sem saber se a operação suporta novos clientes com a estrutura atual.",
        impacto: "moderado",
        alavanca: "aumentar_capacidade",
      },
    ],
  };
}

/**
 * Motor de Diagnóstico Modular e Determinístico
 */
export function executarDiagnosticoEstruturado(
  area: AreaOption | "",
  setor: SetorOption | "",
  sintomaId: string,
  maturidade: MaturidadeOption | "",
  empresaNome: string = "sua empresa"
): DetailedDiagnosticResult {
  const questao = getDynamicQuestion(
    (area as AreaOption) || "comercial",
    (setor as SetorOption) || "servicos"
  );
  const opcaoEscolhida = questao.opcoes.find((o) => o.id === sintomaId) || questao.opcoes[0];

  const alavanca = opcaoEscolhida.alavanca;

  // 1. Definição da Alavanca Econômica
  const alavancaTextos: Record<AlavancaEconomica, string> = {
    gerar_receita: "Gerar Receita: Ativação de novas contas, reativação de base inativa e ampliação de pipeline qualificado.",
    converter_receita: "Converter Receita: Redução drástica da latência de resposta, cadência de follow-up e eliminação de perdas no funil.",
    reduzir_custos: "Reduzir Custos: Desmobilização de horas manuais em cotações, conciliações e eliminação de retrabalhos evitáveis.",
    aumentar_capacidade: "Aumentar Capacidade: Escala elástica sem contratações proporcionais, automação de triagem e fluxo assistido.",
  };

  // 2. Grau de Maturidade de Dados
  let nivelMaturidade: "Baixa (Dados Manuais)" | "Média (Dados Dispersos)" | "Alta (Dados Estruturados)";
  let diagnosticoMaturidade: string;
  let riscoMaturidade: string;

  if (maturidade === "manuais") {
    nivelMaturidade = "Baixa (Dados Manuais)";
    diagnosticoMaturidade =
      "A operação apoia-se predominantemente em anotações soltas, WhatsApp individual e memória da equipe. Os dados não geram inteligência automatizável de imediato.";
    riscoMaturidade =
      "Risco alto de dependência de pessoas específicas e perda de informações históricas de clientes e custos.";
  } else if (maturidade === "estruturados") {
    nivelMaturidade = "Alta (Dados Estruturados)";
    diagnosticoMaturidade =
      "A empresa já possui CRM ou ERP formal com campos preenchidos. O desafio é conectar a camada analítica e criar fluxos autônomos de ação.";
    riscoMaturidade =
      "Risco moderado de subutilização de sistemas caros por falta de conectores inteligentes de automação.";
  } else {
    nivelMaturidade = "Média (Dados Dispersos)";
    diagnosticoMaturidade =
      "Existem sistemas e planilhas, porém não conversam entre si. A equipe atua como 'ponte humana' para transcrever dados entre telas.";
    riscoMaturidade =
      "Fuga de tempo qualificado em tarefas operacionais e atraso de dias para consolidar números gerenciais.";
  }

  // 3. Arquitetura Recomendada nos 3 Pilares do Método AC (CÉREBRO, AGENTES, TRAÇÃO)
  const pilares: ArchitecturePillar[] = [
    {
      nome: "CÉREBRO",
      titulo: "Camada de Dados & Inteligência Centralizada",
      descricao:
        maturidade === "estruturados"
          ? "Conexão de Webhooks diretamente ao banco de dados relacional (Supabase PostgreSQL com RLS), auditando cada evento e unificando o histórico do cliente."
          : "Implantação de Data Warehouse leve estruturado (Supabase), limpando registros manuais e estabelecendo a fonte única da verdade para a diretoria.",
      tecnologiasJustificadas: ["Supabase PostgreSQL", "Row Level Security (LGPD)", "Trilhas de Auditoria"],
    },
    {
      nome: "AGENTES",
      titulo: "Automação Cognitiva & Triagem Assistida",
      descricao:
        area === "comercial"
          ? "Agentes de IA Comercial treinados na proposta de valor da empresa para triagem instantânea (< 5 min), qualificação por critérios objetivos de ICP e roteamento para executivos."
          : "Agentes operacionais para leitura, conciliação e conferência de documentos e solicitações, eliminando digitação manual repetitiva com supervisão humana.",
      tecnologiasJustificadas: ["OpenAI GPT-4o com JSON Schema", "Deno Edge Runtime", "Supervisão Humana Estruturada"],
    },
    {
      nome: "TRAÇÃO",
      titulo: "Orquestração de Canais & Cockpit Executivo",
      descricao:
        "Esteira automatizada integrada ao WhatsApp corporativo e e-mail com alertas em tempo real para a liderança e acompanhamento dos KPIs contratuais de negócio.",
      tecnologiasJustificadas: ["Meta Cloud WhatsApp API", "Resend Transactional", "Painel de Métricas em Tempo Real"],
    },
  ];

  // 4. Indicadores necessários para comprovar o impacto após implantação
  const indicadores: string[] = [
    "Baseline oficial de tempo médio de primeira resposta (medido minuto a minuto)",
    "Taxa real de conversão de oportunidades em reuniões/agendamentos qualificados",
    "Volume de horas semanais efetivamente desmobilizadas de tarefas manuais",
    "Custo por oportunidade qualificada gerada (CAC operacional)",
  ];

  if (alavanca === "reduzir_custos") {
    indicadores.push("Discrepâncias de cotação e horas gastas em conferência manual de propostas");
  } else {
    indicadores.push("Receita incremental gerada em relação ao período homólogo anterior");
  }

  // 5. Roadmap de 90 Dias
  const roadmap = [
    {
      fase: "Fase 1: Mapeamento & Baseline",
      prazoDias: "0 a 15 dias",
      objetivo: "Auditar a rotina atual, validar indicadores oficiais e desenhar o fluxo técnico homologado.",
      entregaveis: ["Baseline de dados aprovado", "Blueprint da arquitetura técnica", "Definição do KPI contratual principal"],
    },
    {
      fase: "Fase 2: Estruturação & Primeiro Fluxo",
      prazoDias: "16 a 30 dias",
      objetivo: "Subir a camada de banco de dados relacional e implantar o primeiro agente no fluxo mais crítico.",
      entregaveis: ["Ambiente Supabase configurado", "Primeiro agente em homologação", "Disparo do primeiro canal assistido"],
    },
    {
      fase: "Fase 3: Integração & Operação Assistida",
      prazoDias: "31 a 60 dias",
      objetivo: "Conectar CRM/ERP existentes, habilitar supervisão humana e rodar operação em produção monitorada.",
      entregaveis: ["Conexão multicanal ativa", "Treinamento prático da equipe", "Monitoramento diário de latência e qualidade"],
    },
    {
      fase: "Fase 4: Cockpit, Otimização & Expansão",
      prazoDias: "61 a 90 dias",
      objetivo: "Consolidar os ganhos econômicos reais em painel executivo e planejar expansão para novas áreas.",
      entregaveis: ["Relatório de impacto comprovado pós-implantação", "Cockpit executivo em tempo real", "Planejamento de esteira de LTV/recorrência"],
    },
  ];

  return {
    problemaDeclarado: opcaoEscolhida.title,
    causaProvavel:
      opcaoEscolhida.desc ||
      `Processos dependentes de esforço humano manual contínuo, sem orquestração de dados em tempo real em ${empresaNome}.`,
    consequenciaEconomica:
      opcaoEscolhida.impacto === "critico"
        ? "Sangramento contínuo de margem financeira decorrente de perda de timing comercial e sobrecarga de profissionais seniores."
        : "Perda evitável de produtividade e capacidade de expansão travada pela necessidade de contratações lineares.",
    alavancaPrioritaria: alavanca,
    alavancaDescricao: alavancaTextos[alavanca],
    grauMaturidadeDados: {
      nivel: nivelMaturidade,
      diagnostico: diagnosticoMaturidade,
      riscoPrincipal: riscoMaturidade,
    },
    arquiteturaRecomendada: {
      titulo: `Infraestrutura AI-First de ${alavanca === "reduzir_custos" ? "Eficiência & Suprimentos" : "Aquisição & Tração Operacional"}`,
      pilares,
      fluxoResumo: `[Canal de Entrada / WhatsApp] ➔ [Cérebro: Supabase com RLS] ➔ [Agente de IA: Triagem & Enriquecimento] ➔ [Cockpit Executivo & Time de Fechamento]`,
      disclaimer:
        "Esta arquitetura técnica preliminar é desenhada sob o Método AC (Cérebro, Agentes, Tração). Não comercializamos agentes isolados; construímos a infraestrutura completa de dados e automação assistida para garantir conformidade e resultado mensurável.",
    },
    indicadoresNecessariosParaComprovacao: indicadores,
    roadmapEstimadoFases: roadmap,
  };
}
