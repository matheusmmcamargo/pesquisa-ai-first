import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WhatsApp do Matheus que recebe o aviso de novo diagnóstico (pode ser trocado pelo secret ADMIN_WHATSAPP)
const ADMIN_WHATSAPP_DEFAULT = "5514996466599";
// Instância da Evolution que envia o aviso (defina o secret EVOLUTION_INSTANCE para trocar)
const EVOLUTION_INSTANCE_DEFAULT = "14991241181";
const SITE_BASE = "https://agenciacamargo.com/pesquisa";

function normalizeBrPhone(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return `55${digits}`;
}

function show(value: unknown, prefix = "", suffix = ""): string {
  if (value === null || value === undefined || value === "") return "não informado";
  return `${prefix}${value}${suffix}`;
}

function showPercent(fraction: unknown): string {
  const n = Number(fraction);
  if (fraction === null || fraction === undefined || fraction === "" || Number.isNaN(n)) return "não informado";
  return `${Number((n * 100).toFixed(1))}%`;
}

function escapeHtml(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Chama a OpenAI com a mesma chave do LeadBot (OPEN_AI_API_KEY); OPENAI_API_KEY fica só como reserva.
async function callOpenAI(messages: unknown[]): Promise<string> {
  const keys = [Deno.env.get("OPEN_AI_API_KEY"), Deno.env.get("OPENAI_API_KEY")].filter((k): k is string => !!k);
  if (keys.length === 0) throw new Error("Nenhuma chave da OpenAI configurada");
  let lastError = "";
  for (const key of keys) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", response_format: { type: "json_object" }, messages, temperature: 0.4 }),
      signal: AbortSignal.timeout(45000),
    });
    const body = await res.json().catch(() => ({}));
    const content = body?.choices?.[0]?.message?.content;
    if (res.ok && content) return content;
    lastError = `OpenAI ${res.status}: ${body?.error?.message ?? "resposta sem conteúdo"}`;
    console.error("[pesquisa-triagem-lead]", lastError);
  }
  throw new Error(lastError);
}

// Envio best-effort: uma falha aqui nunca pode derrubar a triagem nem o e-mail.
async function notifyAdminWhatsApp(text: string): Promise<void> {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE") ?? EVOLUTION_INSTANCE_DEFAULT;
  const to = (Deno.env.get("ADMIN_WHATSAPP") ?? ADMIN_WHATSAPP_DEFAULT).replace(/\D/g, "");

  if (!apiUrl || !apiKey) {
    console.warn("[pesquisa-triagem-lead] WhatsApp não enviado: defina EVOLUTION_API_URL e EVOLUTION_API_KEY.");
    return;
  }

  try { console.log("[pesquisa-triagem-lead] Evolution host:", new URL(apiUrl).host, "instancia:", instance); } catch (_e) { console.warn("[pesquisa-triagem-lead] EVOLUTION_API_URL inválida (use http://IP:PORTA)"); }

  // Evolution API v2: corpo com "number" e "text" (o formato antigo "textMessage" é da v1)
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: to, text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    console.error("[pesquisa-triagem-lead] Falha ao enviar WhatsApp:", res.status, await res.text());
  }
}

async function sendResend(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("[pesquisa-triagem-lead] E-mail não enviado: RESEND_API_KEY ausente.");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
    body: JSON.stringify({ from: "Agência Camargo <contato@agenciacamargo.com>", to, reply_to: "contato@agenciacamargo.com", subject, html }),
  });
  if (!res.ok) console.error("[pesquisa-triagem-lead] Falha ao enviar e-mail:", res.status, await res.text());
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Autenticação do webhook: segredo guardado no Vault (verificado via RPC com service role)
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: okSecret } = await supabase.rpc("pesquisa_check_secret", { p_secret: req.headers.get("x-webhook-secret") ?? "" });
    if (okSecret !== true) return json({ error: "unauthorized" }, 401);

    const payload = await req.json();
    const lead = payload.record;
    if (!lead) throw new Error("Lead inválido");

    let siteContext = "Site não informado.";
    if (lead.site) {
      try {
        const targetUrl = lead.site.startsWith("http") ? lead.site : `https://${lead.site}`;
        const siteReq = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
        siteContext = (await siteReq.text()).replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim().substring(0, 1500);
      } catch (_e) {
        siteContext = "Não foi possível acessar o site automaticamente.";
      }
    }

    // Slug amigável para a URL
    const nomeBase = lead.nome_empresa && lead.nome_empresa.trim() !== "" ? lead.nome_empresa : lead.nome;
    const slugRaw = `${nomeBase}-${lead.nome}`;
    const slug = slugRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60) || "diagnostico";
    const deckUrl = `${SITE_BASE}/deck/${slug}/${lead.id}`;
    const leadPhone = normalizeBrPhone(lead.whatsapp);
    const r = lead.respostas ?? {};

    // A conta é feita aqui, em código, para a IA não errar nem arredondar de forma diferente do diagnóstico.
    const nLeads = Number(r.leads_mensais);
    const nConv = Number(r.taxa_conversao);
    const nTicket = Number(r.ticket_medio);
    const podeCalcular = r.leads_mensais != null && r.taxa_conversao != null && r.ticket_medio != null && [nLeads, nConv, nTicket].every((n) => Number.isFinite(n) && n > 0);
    const contaPronta = podeCalcular
      ? `Conta já calculada (use exatamente estes valores, sem recalcular): vendas por mês = ${Number((nLeads * nConv).toFixed(1)).toLocaleString("pt-BR")}; faturamento atual = R$ ${Math.round(nLeads * nConv * nTicket).toLocaleString("pt-BR")} por mês.`
      : "Faltam números para fazer a conta: diga que ela não pode ser feita sem eles.";

    const systemPrompt = `
      Você analisa as respostas de um formulário de diagnóstico da Agência Camargo e escreve em português do Brasil, com acentuação e ortografia corretas, em linguagem simples, para donos de pequenas e médias empresas. Retorne OBRIGATORIAMENTE um objeto JSON com "emailHtml" e "deckData".

      Regras obrigatórias:
      - Use somente os dados informados. Nunca invente números, clientes, percentuais de ganho, prazos ou promessas de resultado. Se faltar um dado, diga que ele não foi informado.
      - Quando houver "Conta já calculada", use exatamente esses valores e diga como foram obtidos (contatos x conversão x ticket médio). Nunca recalcule nem arredonde de outro jeito. Escreva valores em reais (R$).
      - Não comente sobre o site da empresa nem diga que ele não foi informado.
      - Não use jargão de agência ou de tecnologia (nada de arquitetura, FP&A, pipeline, orquestração, latência, baseline, stack). Não escreva promessas como "sem falhas" ou "operação autônoma".
      - "cenario_atual" deve ter no máximo 4 frases curtas, em linguagem simples para o dono da empresa: onde está o gargalo, a conta que mostra o tamanho do problema e o que falta saber.
      - "emailHtml" é um resumo interno para o time comercial da Agência Camargo. Mantenha exatamente a estrutura HTML abaixo.

      Estrutura do JSON esperada:
      {
        "emailHtml": "<div style='font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;'><h2 style='font-size: 24px; margin-bottom: 24px;'>Resumo interno do lead</h2><p style='margin-bottom: 16px;'><b>Lead Score:</b> [Alto, Médio ou Baixo]</p><p style='margin-bottom: 16px;'><b>Empresa:</b> [Nome da empresa]</p><p style='margin-bottom: 16px;'><b>Resumo do negócio:</b> [O que a empresa faz, com base no site e nas respostas]</p><p style='margin-bottom: 16px;'><b>Diagnóstico do gargalo:</b> [Texto com a conta feita a partir dos números informados]</p><p style='margin-bottom: 8px;'><b>Pontos para a reunião:</b></p><ul style='margin-bottom: 24px; padding-left: 20px;'><li>[Ponto 1]</li><li>[Ponto 2]</li><li>[Ponto 3]</li></ul><p style='margin-bottom: 16px;'><b>Dados que faltam:</b> [Lista do que não foi informado, ou 'nenhum']</p></div>",
        "deckData": {
          "nome_pessoa": "[Nome do lead]",
          "empresa_lead": "[Nome da empresa, ou o nome da pessoa se não houver empresa]",
          "cenario_atual": "[Texto simples de até 4 frases]"
        }
      }
      Retorne apenas o JSON puro, sem formatação markdown.
    `;

    const userPrompt = `
      Lead: ${lead.nome_empresa} | Contato: ${lead.nome} (${lead.cargo})
      Gargalo Relatado: ${lead.gargalo} | Ponto Crítico: ${lead.respostas?.dor || "N/A"}
      Ecossistema: ${lead.ferramental} | Urgência: ${lead.urgencia}
      Canal principal de entrada de clientes: ${lead.respostas?.canal_principal || "Não informado"}
      Quem vende hoje: ${lead.respostas?.quem_vende || "Não informado"}
      Tempo de resposta declarado ao lead: ${lead.respostas?.tempo_resposta_declarado || "Não informado"}

      --- DADOS FINANCEIROS ---
      ${contaPronta}
      Faturamento Base: ${lead.faturamento}
      Leads/Oportunidades por Mês: ${lead.leads_mes || lead.respostas?.leads_mensais || "Não informado / Não sabe"}
      Taxa de Conversão Atual: ${showPercent(lead.respostas?.taxa_conversao)}
      Ticket Médio: ${lead.ticket_medio || lead.respostas?.ticket_medio || "Não informado / Não sabe"}
      Horas Gastas em Tarefas Manuais: ${lead.horas_manuais || lead.respostas?.horas_manuais || "Não informado / Não sabe"}
      
      Contexto do Site: ${siteContext}
    `;

    let parsedResponse: { emailHtml?: string; deckData?: unknown } | null = null;
    try {
      const aiContent = await callOpenAI([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]);
      parsedResponse = JSON.parse(aiContent);
      await supabase.from("pesquisa_leads").update({ analise_ai: parsedResponse!.emailHtml, deck_data: parsedResponse!.deckData, status: "analisado" }).eq("id", lead.id);
    } catch (aiErr) {
      // Falha da IA não pode esconder o lead: avisa o admin para atender manualmente.
      console.error("[pesquisa-triagem-lead] IA falhou:", (aiErr as Error)?.message);
      await supabase.from("pesquisa_leads").update({ status: "falha_ia" }).eq("id", lead.id);
    }

    const sendInternalEmail = async () => {
      const body = parsedResponse?.emailHtml
        ? parsedResponse.emailHtml
        : `<p style="font-family:sans-serif"><b>A análise automática não funcionou</b> para este lead. Atenda manualmente.</p>
           <p style="font-family:sans-serif">${escapeHtml(lead.nome)} (${escapeHtml(lead.cargo)}) - ${escapeHtml(lead.nome_empresa)}<br>E-mail: ${escapeHtml(lead.email)}<br>Gargalo: ${escapeHtml(lead.gargalo)}</p>`;
      const emailBody = `
        ${body}
        <br><br>
        ${leadPhone ? `<p style="font-family: sans-serif;"><b>WhatsApp do lead:</b> <a href="https://wa.me/${leadPhone}">https://wa.me/${leadPhone}</a></p>` : ""}
        <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">
          <a href="${deckUrl}" style="background-color: #000000; color: #D4AF37; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #D4AF37; display: inline-block; font-family: sans-serif;">Abrir o diagnóstico</a>
        </td></tr></table>
      `;
      await sendResend("contato@agenciacamargo.com", `${parsedResponse ? "🚨 Novo diagnóstico" : "⚠️ Atender manualmente"}: ${lead.nome_empresa || lead.nome}`, emailBody);
    };

    // Cópia para o próprio lead (pula e-mails de teste)
    const sendLeadCopy = async () => {
      const email = String(lead.email ?? "").trim().toLowerCase();
      if (!parsedResponse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      if (/@(example|test|teste|invalid)\.|@.*\.test$/.test(email)) return;
      const html = `
        <div style="font-family:sans-serif;font-size:15px;color:#111;line-height:1.6;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="font-size:22px">${escapeHtml(String(lead.nome).split(" ")[0])}, seu diagnóstico está pronto</h2>
          <p>Analisamos as respostas da ${escapeHtml(lead.nome_empresa || "sua empresa")} e montamos uma estimativa de onde o dinheiro está escapando e um caminho para recuperá-lo.</p>
          <p style="text-align:center;margin:28px 0"><a href="${deckUrl}" style="background:#B08A61;color:#000;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">Ver meu diagnóstico</a></p>
          <p>Quer conversar sobre os números? Responda este e-mail ou chame no WhatsApp: <a href="https://wa.me/5514991241181">(14) 99124-1181</a>.</p>
          <p style="color:#666;font-size:12px">Agência Camargo. Você recebeu este e-mail porque pediu o diagnóstico em agenciacamargo.com/pesquisa. Para apagar seus dados, responda pedindo a exclusão.</p>
        </div>`;
      await sendResend(email, `Seu diagnóstico da ${lead.nome_empresa || "sua empresa"} está pronto`, html);
    };

    const sendWhatsApp = async () => {
      const brl = (n: number) => `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
      const leads = Number(r.leads_mensais);
      const conv = Number(r.taxa_conversao);
      const ticket = Number(r.ticket_medio);
      const temNumeros = [leads, conv, ticket].every((n) => Number.isFinite(n) && n > 0) && r.leads_mensais !== null && r.taxa_conversao !== null && r.ticket_medio !== null;
      let perda = "Perda estimada: faltaram números para calcular";
      if (temNumeros) {
        const hoje = leads * conv * ticket;
        const escapa = hoje * 0.45; // mesmo cenário "base" do diagnóstico (+45% de conversão)
        perda = `Vende hoje ~${brl(hoje)}/mês. No cenário base (+45% de conversão) escapam ~${brl(escapa)}/mês em vendas`;
      }
      const score = (parsedResponse?.emailHtml ?? "").match(/Lead Score:<\/b>\s*([^<]+)/i)?.[1]?.trim();
      const deck = parsedResponse?.deckData as { cenario_atual?: string } | undefined;
      const resumo = String(deck?.cenario_atual ?? "").replace(/\s+/g, " ").trim();
      const text = [
        `${parsedResponse ? "🚨 Novo diagnóstico" : "⚠️ Novo lead (IA falhou)"}: ${lead.nome_empresa || lead.nome}${score ? ` | Lead score: ${score}` : ""}`,
        `Contato: ${lead.nome} (${show(lead.cargo)}) | Faturamento: ${show(lead.faturamento)}`,
        `Gargalo: ${show(lead.gargalo)} | Urgência: ${show(lead.urgencia)}`,
        `Leads/mês: ${show(r.leads_mensais)} | Conversão: ${showPercent(r.taxa_conversao)} | Ticket: ${show(r.ticket_medio, "R$ ")} | Horas manuais: ${show(r.horas_manuais, "", "h/mês")}`,
        `Tempo de resposta: ${show(r.tempo_resposta_declarado)}`,
        perda,
        resumo ? `Resumo: ${resumo.length > 380 ? resumo.slice(0, 377) + "..." : resumo}` : "",
        leadPhone ? `Falar com o lead: https://wa.me/${leadPhone}` : `E-mail do lead: ${show(lead.email)}`,
        `Dossiê: ${deckUrl}`,
      ].filter(Boolean).join("\n");
      await notifyAdminWhatsApp(text);
    };

    // Envios independentes: se um falhar, os outros seguem.
    const results = await Promise.allSettled([sendInternalEmail(), sendWhatsApp(), sendLeadCopy()]);
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`[pesquisa-triagem-lead] ${["E-mail interno", "WhatsApp", "E-mail do lead"][i]} falhou:`, result.reason);
      }
    });

    return json({ success: true });
  } catch (error: unknown) {
    console.error("[pesquisa-triagem-lead] erro:", (error as Error)?.message);
    return json({ error: (error as Error).message }, 400);
  }
});
