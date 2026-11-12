import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { track } from "../lib/track";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  ArrowUpRight,
  Clock,
  Users,
  Percent,
  Wallet,
  Hourglass,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { FinancialImpactEngine } from "../components/FinancialImpactEngine";

interface LeadRecord {
  id?: string;
  nome_empresa?: string;
  nome?: string;
  cargo?: string;
  segmento?: string;
  gargalo?: string;
  ferramental?: string;
  faturamento?: string;
  urgencia?: string;
  created_at?: string;
  deck_data?: {
    empresa_lead?: string;
    nome_pessoa?: string;
    cenario_atual?: string;
  };
  respostas?: {
    dor?: string;
    maturidade?: string;
    leads_mensais?: number | null;
    taxa_conversao?: number | null;
    ticket_medio?: number | null;
    horas_manuais?: number | null;
    margem_contribuicao?: number | null;
    tempo_resposta_declarado?: string | null;
    canal_principal?: string | null;
    quem_vende?: string | null;
  };
}

const WHATSAPP = "5514991241181";

const SEGMENTOS: Record<string, string> = {
  servicos: "Serviços",
  industria: "Indústria",
  comercio: "Comércio",
  varejo: "Varejo",
  saude_bem_estar: "Saúde e bem-estar",
};

const SECOES = [
  { num: "01", nome: "Resumo", cor: "#C8A070" },
  { num: "02", nome: "Onde escapa", cor: "#D68A2D" },
  { num: "03", nome: "Como resolver", cor: "#6B5DD3" },
  { num: "04", nome: "Quanto escapa", cor: "#1FA971" },
  { num: "05", nome: "Próximo passo", cor: "#C8A070" },
];

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const fmtInt = (n: number) => Math.round(n).toLocaleString("pt-BR");
const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtPct = (f: number) => `${Number((f * 100).toFixed(1)).toLocaleString("pt-BR")}%`;

function SectionShell({
  id,
  etiqueta,
  titulo,
  subtitulo,
  cor,
  children,
}: {
  id: string;
  etiqueta: string;
  titulo: string;
  subtitulo?: string;
  cor: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 print-avoid-break print-page-break animate-in fade-in duration-300">
      <div className="border border-[#282A2E] bg-[#141516] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: cor }} />
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-[#0B0C0D] border mb-4"
          style={{ color: cor, borderColor: `${cor}66` }}
        >
          {etiqueta}
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F3EF] tracking-tight mb-2">{titulo}</h2>
        {subtitulo && <p className="text-sm text-[#A8A9AC] mb-8 max-w-3xl leading-relaxed">{subtitulo}</p>}
        {children}
      </div>
    </section>
  );
}

export default function DeckView() {
  const { id } = useParams<{ id?: string; slug?: string }>();
  const [deck, setDeck] = useState<LeadRecord | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [continuous, setContinuous] = useState<boolean>(false);
  const cancelRef = useRef<() => void>(() => {});

  const total = SECOES.length;

  // A análise leva de 10 a 40 segundos após o envio: consulta repetida até ficar pronta
  useEffect(() => {
    async function loadDeck() {
      if (!id) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      cancelRef.current = () => {
        cancelled = true;
      };
      const startedAt = Date.now();
      try {
        while (!cancelled) {
          const { data, error } = await supabase.rpc("pesquisa_get_deck", { p_id: id });
          const ready =
            !error &&
            data &&
            data.deck_data &&
            (typeof data.deck_data !== "object" || Object.keys(data.deck_data).length > 0);
          if (ready) {
            const parsed = typeof data.deck_data === "string" ? JSON.parse(data.deck_data) : data.deck_data;
            setDeck({ ...data, deck_data: parsed });
            break;
          }
          if (!error && data) {
            setDeck((prev) => prev ?? ({ ...data, deck_data: undefined } as LeadRecord));
          }
          if (Date.now() - startedAt > 90000) {
            setTimedOut(true);
            break;
          }
          await new Promise((r) => setTimeout(r, 4000));
        }
      } catch (err) {
        console.warn("Falha ao buscar diagnóstico:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    track("deck_view");
    loadDeck();
    return () => cancelRef.current();
  }, [id]);

  const next = useCallback(() => setCurrent((p) => Math.min(total - 1, p + 1)), [total]);
  const prev = useCallback(() => setCurrent((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (continuous) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, continuous]);

  // Tudo o que aparece vem das respostas do próprio lead. O que não foi informado aparece como "não informado".
  const d = useMemo(() => {
    const r = deck?.respostas ?? {};
    const leads = isNum(r.leads_mensais) ? r.leads_mensais : null;
    const conv = isNum(r.taxa_conversao) ? r.taxa_conversao : null;
    const ticket = isNum(r.ticket_medio) ? r.ticket_medio : null;
    const horas = isNum(r.horas_manuais) ? r.horas_manuais : null;
    const margem = isNum(r.margem_contribuicao) ? r.margem_contribuicao : null;
    const tempo =
      typeof r.tempo_resposta_declarado === "string" &&
      r.tempo_resposta_declarado &&
      r.tempo_resposta_declarado !== "Não sei"
        ? r.tempo_resposta_declarado
        : null;
    const seg = deck?.segmento ?? "";
    return {
      empresa: deck?.deck_data?.empresa_lead || deck?.nome_empresa || deck?.nome || "sua empresa",
      nome: deck?.deck_data?.nome_pessoa || deck?.nome || "",
      cargo: deck?.cargo || "",
      segmento: SEGMENTOS[seg] ?? (seg ? seg.replace(/_/g, " ") : ""),
      ferramental: deck?.ferramental || "",
      faturamento: deck?.faturamento && deck.faturamento !== "Não informado" ? deck.faturamento : "",
      urgencia: deck?.urgencia || "",
      gargalo: deck?.gargalo || "",
      dor: r.dor || "",
      canal: r.canal_principal || "",
      quemVende: r.quem_vende || "",
      leads,
      conv,
      ticket,
      horas,
      margem,
      tempo,
      resumoIA: deck?.deck_data?.cenario_atual || "",
      data: deck?.created_at
        ? new Date(deck.created_at).toLocaleDateString("pt-BR")
        : "",
      vendasMes: leads !== null && conv !== null ? leads * conv : null,
    };
  }, [deck]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0B0C0D] flex flex-col items-center justify-center text-[#C8A070]">
        <div className="w-8 h-8 mb-4 rounded-full border-2 border-[#C8A070]/30 border-t-[#C8A070] animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#F5F3EF]">
          Preparando o seu diagnóstico...
        </span>
        <span className="mt-2 text-xs text-[#A8A9AC] max-w-xs text-center">
          Estamos analisando suas respostas. Costuma levar menos de 1 minuto.
        </span>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="h-screen w-screen bg-[#0B0C0D] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-extrabold text-[#F5F3EF] mb-2">Não encontramos este diagnóstico</h1>
        <p className="text-sm text-[#A8A9AC] max-w-md mb-6">
          O link pode estar incompleto ou o diagnóstico foi removido. Você pode fazer um novo em poucos minutos.
        </p>
        <Link
          to="/assessment"
          className="px-6 py-3 rounded-xl bg-[#C8A070] text-[#0B0C0D] font-bold text-sm hover:brightness-110 transition"
        >
          Fazer meu diagnóstico
        </Link>
      </div>
    );
  }

  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Olá! Vi o diagnóstico da ${d.empresa} e quero marcar uma reunião.`
  )}`;

  const naoInformado = <span className="text-[#A8A9AC] text-base font-semibold">Não informado</span>;

  const dadosDeclarados = [
    { icone: Users, rotulo: "Contatos por mês", valor: d.leads !== null ? fmtInt(d.leads) : null },
    { icone: Percent, rotulo: "Viram cliente", valor: d.conv !== null ? fmtPct(d.conv) : null },
    { icone: Wallet, rotulo: "Ticket médio", valor: d.ticket !== null ? fmtBRL(d.ticket) : null },
    { icone: Hourglass, rotulo: "Horas em tarefas manuais", valor: d.horas !== null ? `${fmtInt(d.horas)} h/mês` : null },
  ];

  const perdidos = d.leads !== null && d.vendasMes !== null ? Math.max(0, Math.round(d.leads - d.vendasMes)) : null;
  const diasTrabalho = d.horas !== null ? Number((d.horas / 8).toFixed(1)).toLocaleString("pt-BR") : null;

  return (
    <div className="min-h-screen w-full bg-[#0B0C0D] text-[#F5F3EF] flex flex-col font-sans relative selection:bg-[#C8A070]/30 selection:text-white">
      {timedOut && !deck.deck_data && (
        <div className="w-full bg-[#C8A070] text-[#0B0C0D] text-xs font-semibold text-center px-4 py-2 print:hidden">
          Sua análise ainda está sendo finalizada. Atualize a página em alguns minutos ou fale com a gente no WhatsApp.
        </div>
      )}

      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 w-full border-b border-[#282A2E] bg-[#0B0C0D]/95 backdrop-blur-md px-4 sm:px-10 py-3 flex items-center justify-between gap-3 print:hidden">
        <Link to="/" className="flex items-center gap-3 group min-w-0">
          <img src="/agencia-camargo-logo-white.png" alt="Agência Camargo" className="h-6 sm:h-7 w-auto object-contain" />
          <div className="h-4 w-px bg-[#282A2E] hidden sm:block" />
          <span className="text-[10px] text-[#A8A9AC] uppercase tracking-wider hidden sm:block">Seu diagnóstico</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141516] border border-[#282A2E] text-xs font-mono">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECOES[current].cor }} />
          <span className="text-[#F5F3EF] font-bold">
            {SECOES[current].num} • {SECOES[current].nome}
          </span>
          <span className="text-[#A8A9AC]/40">|</span>
          <span className="text-[#A8A9AC]">{d.empresa}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setContinuous(!continuous)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-[#282A2E] bg-[#141516] text-[#A8A9AC] hover:text-[#F5F3EF] transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{continuous ? "Ver por seções" : "Ver tudo de uma vez"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#C8A070] hover:brightness-110 text-[#0B0C0D] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Salvar em PDF</span>
          </button>
        </div>
      </header>

      {/* Navegação entre seções */}
      <nav className="w-full bg-[#141516]/80 border-b border-[#282A2E]/80 px-4 sm:px-10 py-2.5 overflow-x-auto print:hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 min-w-max">
          {SECOES.map((s, index) => {
            const active = current === index;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setCurrent(index);
                  if (continuous) document.getElementById(`secao-${index}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
                  active
                    ? "bg-[#1B1C1E] font-bold text-[#F5F3EF]"
                    : "text-[#A8A9AC] hover:text-[#F5F3EF] hover:bg-[#1B1C1E]/50 border-transparent"
                }`}
                style={{ borderColor: active ? s.cor : undefined }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.cor }} />
                <span>
                  {s.num} • {s.nome}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-10 py-8 sm:py-12 pb-36">
        {/* 01 — RESUMO */}
        {(continuous || current === 0) && (
          <SectionShell
            id="secao-0"
            etiqueta="Diagnóstico preliminar"
            titulo={`Diagnóstico da ${d.empresa}`}
            subtitulo={`${d.nome ? `Preparado para ${d.nome}${d.cargo ? ` (${d.cargo})` : ""}` : "Preparado para você"}${
              d.data ? ` em ${d.data}` : ""
            }. Baseado nas respostas que você deu no formulário.`}
            cor={SECOES[0].cor}
          >
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#C8A070] font-bold mb-3">
              O que você nos contou
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {dadosDeclarados.map((item) => (
                <div key={item.rotulo} className="p-4 rounded-xl bg-[#0B0C0D] border border-[#282A2E]">
                  <item.icone className="w-4 h-4 text-[#C8A070] mb-2" />
                  <div className="text-xl sm:text-2xl font-black text-[#F5F3EF] leading-tight">
                    {item.valor ?? naoInformado}
                  </div>
                  <span className="text-[11px] text-[#A8A9AC] block mt-1">{item.rotulo}</span>
                </div>
              ))}
            </div>

            {(d.gargalo || d.dor) && (
              <div className="p-5 rounded-2xl bg-[#0B0C0D] border-l-4 border-[#D68A2D] mb-8">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#D68A2D] font-bold block mb-2">
                  Principal dificuldade que você apontou
                </span>
                {d.gargalo && <p className="text-base font-semibold text-[#F5F3EF] leading-snug">{d.gargalo}</p>}
                {d.dor && <p className="text-sm text-[#A8A9AC] mt-2 leading-relaxed">{d.dor}</p>}
              </div>
            )}

            {d.resumoIA && (
              <div className="mb-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#C8A070] font-bold mb-3">
                  Nossa leitura do seu caso
                </h3>
                <p className="text-sm sm:text-base text-[#F5F3EF] leading-relaxed max-w-3xl">{d.resumoIA}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#282A2E] text-xs">
              <div>
                <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">Segmento</span>
                <strong className="text-[#F5F3EF] text-sm">{d.segmento || "Não informado"}</strong>
              </div>
              <div>
                <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">Ferramentas hoje</span>
                <strong className="text-[#F5F3EF] text-sm">{d.ferramental || "Não informado"}</strong>
              </div>
              <div>
                <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">Prioridade</span>
                <strong className="text-[#F5F3EF] text-sm">{d.urgencia || "Não informada"}</strong>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#0B0C0D]/60 border border-[#282A2E] text-xs text-[#A8A9AC] flex items-start gap-3 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#C8A070] shrink-0 mt-0.5" />
              <p>
                <strong className="text-[#F5F3EF] font-semibold">Como ler este diagnóstico:</strong> é uma estimativa
                feita apenas com as respostas do formulário. Não substitui uma análise contábil. Na reunião conferimos
                os números com você antes de qualquer decisão.
              </p>
            </div>
          </SectionShell>
        )}

        {/* 02 — ONDE ESCAPA */}
        {(continuous || current === 1) && (
          <SectionShell
            id="secao-1"
            etiqueta="Seção 02 • Onde escapa"
            titulo="Onde a sua empresa está perdendo dinheiro"
            subtitulo="Três pontos que aparecem quando olhamos os números que você informou."
            cor={SECOES[1].cor}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="p-6 rounded-2xl bg-[#0B0C0D] border border-[#A94F4F]/40 flex flex-col">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A94F4F] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Tempo de resposta
                </span>
                <div className="text-2xl font-black text-[#F5F3EF] mb-2 leading-tight">
                  {d.tempo ?? <span className="text-[#A8A9AC] text-lg">Não informado</span>}
                </div>
                <p className="text-xs text-[#A8A9AC] leading-relaxed">
                  É quanto tempo um novo contato espera pela primeira resposta. Quanto mais demora, maior a chance de o
                  cliente procurar outro fornecedor.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B0C0D] border border-[#D68A2D]/40 flex flex-col">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D68A2D] mb-2 flex items-center gap-1.5">
                  <Percent className="w-3 h-3" /> Contatos que não viram cliente
                </span>
                <div className="text-2xl font-black text-[#F5F3EF] mb-2 leading-tight">
                  {perdidos !== null ? (
                    `${fmtInt(perdidos)} de ${fmtInt(d.leads as number)}`
                  ) : (
                    <span className="text-[#A8A9AC] text-lg">Faltam números</span>
                  )}
                </div>
                <p className="text-xs text-[#A8A9AC] leading-relaxed">
                  {d.vendasMes !== null && d.conv !== null
                    ? `Com conversão de ${fmtPct(d.conv)}, cerca de ${fmtInt(d.vendasMes)} contatos por mês viram cliente. O restante vai embora, em parte por falta de resposta rápida e de acompanhamento.`
                    : "Informando contatos por mês e quantos viram cliente, calculamos quantos ficam pelo caminho."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B0C0D] border border-[#5E89C7]/40 flex flex-col">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5E89C7] mb-2 flex items-center gap-1.5">
                  <Hourglass className="w-3 h-3" /> Tempo da equipe
                </span>
                <div className="text-2xl font-black text-[#F5F3EF] mb-2 leading-tight">
                  {d.horas !== null ? (
                    `${fmtInt(d.horas)} h por mês`
                  ) : (
                    <span className="text-[#A8A9AC] text-lg">Não informado</span>
                  )}
                </div>
                <p className="text-xs text-[#A8A9AC] leading-relaxed">
                  {diasTrabalho !== null
                    ? `Equivale a cerca de ${diasTrabalho} dias de trabalho por mês gastos em tarefas manuais e repetitivas, tempo que poderia ir para vender e atender.`
                    : "Horas gastas em digitação, planilhas e tarefas repetitivas que poderiam ser automáticas."}
                </p>
              </div>
            </div>

            {(d.canal || d.quemVende || d.ferramental) && (
              <div className="p-5 rounded-2xl bg-[#0B0C0D] border border-[#282A2E] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">
                    Por onde chegam os clientes
                  </span>
                  <strong className="text-sm text-[#F5F3EF]">{d.canal || "Não informado"}</strong>
                </div>
                <div>
                  <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">Quem vende hoje</span>
                  <strong className="text-sm text-[#F5F3EF]">{d.quemVende || "Não informado"}</strong>
                </div>
                <div>
                  <span className="text-[#A8A9AC] uppercase font-mono text-[10px] block mb-1">
                    Ferramentas que usa
                  </span>
                  <strong className="text-sm text-[#F5F3EF]">{d.ferramental || "Não informado"}</strong>
                </div>
              </div>
            )}
          </SectionShell>
        )}

        {/* 03 — COMO RESOLVER */}
        {(continuous || current === 2) && (
          <SectionShell
            id="secao-2"
            etiqueta="Seção 03 • Como resolver"
            titulo="Como vamos resolver na prática"
            subtitulo="Três passos simples. A sua equipe continua no comando: a automação cuida do que é repetitivo."
            cor={SECOES[2].cor}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[
                {
                  n: "1",
                  titulo: "Organizar os contatos e os números",
                  texto:
                    "Reunimos contatos, conversas e vendas em um só lugar. Assim você enxerga de onde vêm os clientes e em que ponto cada um se perde.",
                },
                {
                  n: "2",
                  titulo: "Responder e acompanhar automaticamente",
                  texto:
                    "Todo contato recebe uma primeira resposta rápida e um acompanhamento no prazo certo. Quando o cliente está pronto, a conversa vai para a sua equipe.",
                },
                {
                  n: "3",
                  titulo: "Medir e ajustar todo mês",
                  texto:
                    "Acompanhamos a taxa de conversão e o tempo de resposta mês a mês, e ajustamos o que não estiver funcionando.",
                },
              ].map((p) => (
                <div key={p.n} className="p-6 rounded-2xl bg-[#0B0C0D] border border-[#6B5DD3]/40">
                  <div className="w-8 h-8 rounded-full bg-[#6B5DD3]/20 border border-[#6B5DD3]/50 text-[#B7AEF2] font-bold text-sm flex items-center justify-center mb-3">
                    {p.n}
                  </div>
                  <strong className="text-base text-[#F5F3EF] block mb-2 leading-snug">{p.titulo}</strong>
                  <p className="text-xs text-[#A8A9AC] leading-relaxed">{p.texto}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-mono uppercase tracking-widest text-[#C8A070] font-bold mb-3">
              Como costumam ser os primeiros 90 dias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { quando: "Semanas 1 e 2", o: "Conferir os números com você e definir o que medir." },
                { quando: "Semanas 3 a 6", o: "Colocar no ar a primeira automação: resposta rápida e acompanhamento." },
                { quando: "Semanas 7 a 12", o: "Ajustar com base nos resultados e decidir o que expandir." },
              ].map((f) => (
                <div key={f.quando} className="p-4 rounded-xl bg-[#0B0C0D] border border-[#282A2E]">
                  <span className="text-[11px] font-mono font-bold text-[#C8A070] block mb-1">{f.quando}</span>
                  <p className="text-xs text-[#F5F3EF] leading-relaxed">{f.o}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#A8A9AC]">
              Isto é um exemplo de caminho. O plano real é definido com você na reunião, de acordo com a sua operação.
            </p>
          </SectionShell>
        )}

        {/* 04 — QUANTO ESCAPA */}
        {(continuous || current === 3) && (
          <SectionShell
            id="secao-3"
            etiqueta="Seção 04 • Quanto escapa"
            titulo="Quanto sua empresa deixa na mesa"
            subtitulo="Simulação em 3 cenários a partir dos números que você informou."
            cor={SECOES[3].cor}
          >
            <FinancialImpactEngine
              initialCommercial={{
                leadsMensais: d.leads,
                taxaConversaoAtual: d.conv,
                ticketMedio: d.ticket,
                tempoPrimeiraRespostaHoras: null,
                possuiFollowUpEstruturado: null,
                agendamentosMensais: null,
                margemContribuicao: d.margem ?? 0.4,
              }}
              initialOperational={{
                horasManuaisMensais: d.horas,
                processosRepetitivosContagem: 4,
                tempoMedioExecucaoMinutos: 30,
                taxaRetrabalho: null,
                custoHoraHomem: null,
                capacidadeAtendimentoMensal: null,
              }}
              alavancaPrioritaria="converter_receita"
              empresaNome={d.empresa}
            />
          </SectionShell>
        )}

        {/* 05 — PRÓXIMO PASSO */}
        {(continuous || current === 4) && (
          <SectionShell
            id="secao-4"
            etiqueta="Seção 05 • Próximo passo"
            titulo="Vamos conversar sobre o seu caso"
            subtitulo="Uma conversa de 45 minutos, sem compromisso."
            cor={SECOES[4].cor}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { n: "1", t: "Conferimos os seus números", d: "Revisamos juntos o que você informou, para a conta ficar fiel à sua realidade." },
                { n: "2", t: "Mostramos por onde começar", d: "Indicamos o ponto que mais recupera vendas e tempo na sua operação." },
                { n: "3", t: "Você decide", d: "O investimento é definido caso a caso, depois de entendermos a sua operação." },
              ].map((s) => (
                <div key={s.n} className="p-5 rounded-2xl bg-[#0B0C0D] border border-[#282A2E]">
                  <div className="w-7 h-7 rounded-full bg-[#C8A070]/15 border border-[#C8A070]/40 text-[#D7B779] font-bold text-xs flex items-center justify-center mb-3">
                    {s.n}
                  </div>
                  <strong className="text-sm text-[#F5F3EF] block mb-1">{s.t}</strong>
                  <p className="text-xs text-[#A8A9AC] leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 print:hidden">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C8A070] text-[#0B0C0D] font-extrabold text-sm hover:brightness-110 transition"
              >
                <span>Marcar reunião pelo WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-[#282A2E] bg-[#141516] hover:bg-[#1B1C1E] text-[#F5F3EF] font-bold text-sm transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Salvar diagnóstico em PDF</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[#282A2E] text-xs text-[#A8A9AC] leading-relaxed space-y-2">
              <p>
                Este é um diagnóstico preliminar, feito com as informações que você forneceu. Os resultados são
                estimativas e não representam garantia.
              </p>
              <p>
                Seus dados são usados apenas para preparar este diagnóstico e o nosso contato. Veja a{" "}
                <Link to="/privacidade" className="underline hover:text-[#F5F3EF]">
                  política de privacidade
                </Link>
                .
              </p>
              <p className="font-mono">Agência Camargo • contato@agenciacamargo.com • WhatsApp (14) 99124-1181</p>
            </div>
          </SectionShell>
        )}
      </main>

      {/* Barra inferior de navegação */}
      {!continuous && (
        <footer className="fixed bottom-0 inset-x-0 h-20 bg-[#0B0C0D]/95 backdrop-blur-md border-t border-[#282A2E] px-4 sm:px-10 flex items-center justify-between z-40 print:hidden">
          <div className="text-xs text-[#A8A9AC] font-mono hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECOES[current].cor }} />
            <span>{d.empresa}</span>
          </div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={prev}
              disabled={current === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#282A2E] bg-[#141516] text-sm text-[#F5F3EF] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1B1C1E] transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-xs font-mono text-[#A8A9AC]">
              {current + 1} de {total}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={current === total - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A070] text-[#0B0C0D] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
