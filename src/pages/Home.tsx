import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  MessagesSquare,
  Database,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Target,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F3F4F6] selection:bg-[#B08A61]/30 selection:text-white font-sans">
      {/* ============================================================== */}
      {/* NAVBAR                                                         */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0B0C]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/agencia-camargo-logo-white.png"
              alt="Agência Camargo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
                AGÊNCIA CAMARGO
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#B08A61] uppercase block">
                Crescimento com IA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-gray-400">
            <a href="#pilares" className="hover:text-white transition-colors">
              Pilares
            </a>
            <a href="#infraestrutura" className="hover:text-white transition-colors">
              Infraestrutura
            </a>
            <a href="#metodologia" className="hover:text-white transition-colors">
              Metodologia
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/pesquisa"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B08A61] text-black px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-none cursor-pointer"
            >
              <span>Diagnóstico Gratuito</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* HERO SECTION (FUNDO ESCURO + HEADLINE IA & AUTOMAÇÃO)         */}
      {/* ============================================================== */}
      <section className="relative pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden border-b border-white/5">
        {/* Glow ambient background */}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B08A61]/30 bg-[#B08A61]/10 text-[#B08A61] text-xs font-mono uppercase tracking-wider mb-8">
            <span>Diagnóstico gratuito • leva cerca de 3 minutos</span>
          </div>

          {/* Headline Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Descubra quanto sua empresa{' '}
            <span className="text-[#D7B779]">
              deixa na mesa todo mês
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 font-normal leading-relaxed mb-10">
            Clientes que esfriam por demora na resposta, orçamentos esquecidos, planilhas que ninguém confia. Responda algumas perguntas e receba uma estimativa em reais do dinheiro que está escapando e um plano para recuperá-lo com IA e automação.
          </p>

          {/* Botão de Destaque solicitado */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/pesquisa"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-[#B08A61] text-black px-8 py-5 text-sm sm:text-base font-extrabold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none cursor-pointer group"
            >
              <span>Fazer meu diagnóstico grátis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#pilares"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-7 py-5 text-sm font-semibold transition-all cursor-pointer"
            >
              <span>Ver como funciona</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
          </div>

          {/* Garantias */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">3 min</div>
              <div className="text-xs text-gray-400 mt-1">Para responder, direto no celular</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#B08A61] font-mono">R$</div>
              <div className="text-xs text-gray-400 mt-1">Estimativa do dinheiro parado na sua operação</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Grátis</div>
              <div className="text-xs text-gray-400 mt-1">Sem cartão e sem compromisso</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#B08A61] font-mono">LGPD</div>
              <div className="text-xs text-gray-400 mt-1">Seus dados protegidos e sob sigilo</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SEÇÃO PILARES ESTRATÉGICOS                                     */}
      {/* ============================================================== */}
      <section id="pilares" className="py-24 sm:py-32 relative border-b border-white/5 bg-[#0E0E10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B08A61] font-bold block mb-2">
              Como ajudamos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Três frentes para sua empresa vender mais e gastar menos
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-3">
              Não vendemos ferramentas soltas. Organizamos a operação para o dinheiro parar de escapar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Pilar 1 */}
            <div className="rounded-3xl border border-white/10 bg-[#141416] p-8 hover:border-[#B08A61]/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61] mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                1. Mais clientes, sem deixar ninguém esfriar
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Todo contato recebe resposta rápida e acompanhamento automático, no WhatsApp e onde seu cliente estiver.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="rounded-3xl border border-[#B08A61]/40 bg-[#161514] p-8 hover:border-[#B08A61] transition-all relative group shadow-none">
              <div className="absolute -top-3 right-6 bg-[#B08A61] text-black text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Mais procurado
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#B08A61]/20 border border-[#B08A61]/50 flex items-center justify-center text-[#B08A61] mb-6 group-hover:scale-110 transition-transform">
                <MessagesSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                2. Assistentes de IA que fazem o trabalho repetitivo
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Assistentes treinados com as regras do seu negócio atendem, qualificam e organizam informações, e sua equipe fala só com quem tem chance de comprar.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="rounded-3xl border border-white/10 bg-[#141416] p-8 hover:border-[#B08A61]/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61] mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                3. Números confiáveis na sua mão
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Vendas, estoque e atendimento em um só painel, para decidir com dados e não por intuição.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SEÇÃO METODOLOGIA (O MÉTODO AC — 5 ETAPAS)                     */}
      {/* ============================================================== */}
      <section id="metodologia" className="py-24 sm:py-32 relative border-b border-white/5 bg-[#0C0C0E] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B08A61] font-bold block mb-2">
              O MÉTODO AC
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Da operação desorganizada ao{" "}
              <span className="text-[#D7B779]">
                crescimento mensurável.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
              Descobrimos onde o dinheiro escapa. Colocamos a solução certa no ar. Medimos o que mudou.
            </p>
          </div>

          {/* Mini Diagrama de Transformação */}
          <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-[#141416] border border-white/10 max-w-4xl mx-auto">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#B08A61] font-semibold mb-4 text-center">
              Do problema ao resultado
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/10 text-center">
                <div className="text-xs sm:text-sm font-extrabold tracking-wider font-mono text-amber-400">GARGALO</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Origem da perda</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/10 text-center">
                <div className="text-xs sm:text-sm font-extrabold tracking-wider font-mono text-[#B08A61]">DADOS</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Tudo em um só lugar</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/10 text-center">
                <div className="text-xs sm:text-sm font-extrabold tracking-wider font-mono text-[#D7B779]">SISTEMA</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Automação que trabalha por você</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-white/10 text-center">
                <div className="text-xs sm:text-sm font-extrabold tracking-wider font-mono text-emerald-400">RESULTADO</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Quanto mudou, em reais</div>
              </div>
            </div>
          </div>

          {/* 5 Etapas da Metodologia */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-14">
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#B08A61]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#B08A61]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61]">
                    <Target className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">DIAGNÓSTICO</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Descobrimos onde você perde vendas, tempo e clientes.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] space-y-1">
                <div className="text-[#B08A61] font-mono">Entregável:</div>
                <div className="text-gray-200">Os problemas por ordem de prioridade</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Estimativa em reais
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#B08A61]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#B08A61]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61]">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">PLANO</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Definimos o que automatizar primeiro e como medir o resultado.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] space-y-1">
                <div className="text-[#B08A61] font-mono">Entregável:</div>
                <div className="text-gray-200">Plano e indicadores</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Plano por escrito
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#B08A61]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#B08A61]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61]">
                    <GitBranch className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">IMPLANTAÇÃO</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Colocamos no ar a primeira automação, ligada às ferramentas que você já usa.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] space-y-1">
                <div className="text-[#B08A61] font-mono">Entregável:</div>
                <div className="text-gray-200">Primeira automação funcionando</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> No ar, com a sua equipe
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#B08A61]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#B08A61]">04</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">TESTE</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Acompanhamos a operação real antes de ampliar.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] space-y-1">
                <div className="text-[#B08A61] font-mono">Entregável:</div>
                <div className="text-gray-200">Resultados medidos na prática</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Ajustes com base em dados
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#B08A61]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#B08A61]">05</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B08A61]/10 border border-[#B08A61]/30 flex items-center justify-center text-[#B08A61]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">EVOLUÇÃO</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Ajustamos todo mês o número que mais importa para o seu negócio.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] space-y-1">
                <div className="text-[#B08A61] font-mono">Entregável:</div>
                <div className="text-gray-200">Painel mensal de resultados</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Resultado acompanhado
                </div>
              </div>
            </div>
          </div>

          {/* CTA dentro da Metodologia */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#181716] to-[#121214] border border-[#B08A61]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                Descubra onde sua empresa está perdendo dinheiro
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Diagnóstico gratuito com estimativa em reais, em cerca de 3 minutos.
              </p>
            </div>
            <Link
              to="/pesquisa"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B08A61] text-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shrink-0 cursor-pointer"
            >
              <span>Fazer meu diagnóstico grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SEÇÃO CTA FINAL                                                */}
      {/* ============================================================== */}
      <section id="infraestrutura" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#B08A61] to-[#775432] mx-auto flex items-center justify-center text-black mb-6 shadow-xl shadow-[#B08A61]/20">
            <Layers className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Quer saber quanto sua empresa deixa na mesa?
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Responda algumas perguntas, veja a estimativa em reais e entenda o caminho para recuperar esse dinheiro. Sem compromisso.
          </p>

          <Link
            to="/pesquisa"
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#B08A61] text-black px-10 py-5 text-base font-extrabold uppercase tracking-wider hover:brightness-110 transition-all shadow-none cursor-pointer"
          >
            <span>Fazer meu diagnóstico grátis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="border-t border-white/5 bg-[#09090A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-3">
            <img
              src="/agencia-camargo-logo-white.png"
              alt="Agência Camargo"
              className="h-6 w-auto object-contain"
            />
            <span>AGÊNCIA CAMARGO • CRESCIMENTO COM IA</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pesquisa" className="text-[#B08A61] hover:underline">
              Diagnóstico gratuito
            </Link>
            <Link to="/privacidade" className="hover:underline">Privacidade & LGPD</Link>
          </div>

          <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
