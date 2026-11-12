import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacidade: React.FC = () => (
  <div className="min-h-screen bg-[#0A0A0A] text-gray-300 font-sans">
    <header className="border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img src="/agencia-camargo-logo-white.png" alt="Agência Camargo" className="h-7 w-auto" />
        <span className="font-extrabold text-white text-sm">AGÊNCIA CAMARGO</span>
      </Link>
      <Link to="/pesquisa" className="text-xs text-gray-400 hover:text-white flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar ao diagnóstico
      </Link>
    </header>
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-sm leading-relaxed">
      <h1 className="text-3xl font-extrabold text-white">Política de Privacidade</h1>
      <p className="text-xs text-gray-500">Atualizada em novembro de 2026.</p>

      <section>
        <h2 className="text-lg font-bold text-white mb-1">Quem somos</h2>
        <p>A Agência Camargo é a controladora dos dados coletados neste diagnóstico. Contato para qualquer assunto de privacidade: <a className="text-[#B08A61] underline" href="mailto:contato@agenciacamargo.com">contato@agenciacamargo.com</a>.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Quais dados coletamos</h2>
        <p>Nome, cargo, e-mail, WhatsApp, nome e site da empresa, segmento, faturamento aproximado e as respostas que você dá sobre a operação comercial (canais, equipe, tempo de resposta, ferramentas). Também medimos, de forma anônima, em que etapa do formulário as pessoas avançam ou desistem, para melhorarmos a experiência.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Para que usamos</h2>
        <p>Gerar o seu diagnóstico e a estimativa em reais, enviar o resultado, entrar em contato para apresentar uma proposta quando você aceitar a conversa e melhorar nossos serviços. Não vendemos nem compartilhamos seus dados com terceiros para publicidade.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Base legal</h2>
        <p>Seu consentimento (LGPD, art. 7º, I), dado ao marcar a caixa antes de enviar, e a execução de procedimentos preliminares a um possível contrato (art. 7º, V), quando você pede o diagnóstico.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Com quem os dados passam</h2>
        <p>Usamos fornecedores de tecnologia para operar o serviço: Supabase (armazenamento do banco de dados), OpenAI (geração da análise a partir das suas respostas e do site informado), Resend (envio de e-mails) e Hostinger (hospedagem do site). Eles tratam os dados somente para nos prestar o serviço.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Por quanto tempo guardamos</h2>
        <p>Pelo tempo necessário para o diagnóstico e o relacionamento comercial, e por até 24 meses após o último contato, salvo se você pedir a exclusão antes.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Seus direitos</h2>
        <p>Você pode, a qualquer momento, pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade, exclusão dos dados e revogação do consentimento (LGPD, art. 18). Basta escrever para <a className="text-[#B08A61] underline" href="mailto:contato@agenciacamargo.com">contato@agenciacamargo.com</a>.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Link do seu diagnóstico</h2>
        <p>Seu resultado fica em um endereço com código único e difícil de adivinhar. Não exibimos seu e-mail nem seu WhatsApp nessa página. Quem tiver o link consegue ver o resultado, então compartilhe com cuidado.</p>
      </section>
    </main>
  </div>
);

export default Privacidade;
