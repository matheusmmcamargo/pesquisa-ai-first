import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WhatsApp do Matheus que recebe o aviso de novo diagnóstico (pode ser trocado pelo secret ADMIN_WHATSAPP)
const ADMIN_WHATSAPP_DEFAULT = "5514996466599";

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

// Envio best-effort: uma falha aqui nunca pode derrubar a triagem nem o e-mail.
async function notifyAdminWhatsApp(text: string): Promise<void> {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE");
  const to = (Deno.env.get("ADMIN_WHATSAPP") ?? ADMIN_WHATSAPP_DEFAULT).replace(/\D/g, "");

  if (!apiUrl || !apiKey || !instance) {
    console.warn("[triagem-lead] WhatsApp não enviado: defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.");
    return;
  }

  // Evolution API v2: corpo com "number" e "text" (o formato antigo "textMessage" é da v1)
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: to, text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    console.error("[triagem-lead] Falha ao enviar WhatsApp:", res.status, await res.text());
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const lead = payload.record;
    if (!lead) throw new Error("Lead inválido");

    let siteContext = "Site não informado.";
    if (lead.site) {
      try {
        const targetUrl = lead.site.startsWith("http") ? lead.site : `https://${lead.site}`;
        const siteReq = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
        siteContext = (await siteReq.text()).replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim().substring(0, 1500);
      } catch (e) {
        siteContext = "Não foi possível aceder ao site automaticamente.";
      }
    }

    // Geração do Slug Amigável para a URL
    const nomeBase = lead.nome_empresa && lead.nome_empresa.trim() !== "" ? lead.nome_empresa : lead.nome;
    const slugRaw = `${nomeBase}-${lead.nome}`;
    const slug = slugRaw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const systemPrompt = `
      Você é o "Cérebro Operacional" da Agência Camargo. Retorne OBRIGATORIAMENTE um objeto JSON com "emailHtml" e "deckData".
      
      O "emailHtml" é um DOSSIÊ TÁTICO INTERNO para o CEO.
      
      Regras de Negócio e Matemática (FP&A):
      - Cruze os Dados Financeiros fornecidos (Leads, Conversão, Ticket, Horas). Calcule a receita potencial perdida e o tempo desperdiçado, incluindo essa matemática no Diagnóstico.
      
      Estrutura do JSON Esperada (Siga exatamente este HTML para o e-mail):
      {
        "emailHtml": "<div style='font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;'><h2 style='font-size: 24px; margin-bottom: 24px;'>Dossiê Tático Interno</h2><p style='margin-bottom: 16px;'><b>Lead Score:</b> [Elevado, Médio ou Baixo]</p><p style='margin-bottom: 16px;'><b>Empresa:</b> [Nome da Empresa]</p><p style='margin-bottom: 16px;'><b>Resumo do Negócio:</b> [Leitura do nicho baseada no site]</p><p style='margin-bottom: 16px;'><b>Diagnóstico do Gargalo:</b> [Texto com o cálculo exato de receita perdida/horas gastas baseado nos dados informados]</p><p style='margin-bottom: 8px;'><b>Arquitetura:</b></p><ul style='margin-bottom: 24px; padding-left: 20px;'><li>Implementação de agentes de IA treinados para operação autônoma sem falhas humanas</li><li>[Ponto técnico 2]</li><li>[Ponto técnico 3]</li></ul></div>",
        "deckData": {
          "capa": "Mapeamento de Eficiência & Infraestrutura AI-First",
          "nome_pessoa": "[Nome do Lead]",
          "empresa_lead": "[Nome da Empresa ou Nome da Pessoa]",
          "cenario_atual": "[Análise do gargalo detalhando o desperdício de receita/horas levantado]",
          "arquitetura": [
            "Implementação de agentes de IA treinados para operação autônoma sem falhas humanas",
            "[Ponto 2]",
            "[Ponto 3]"
          ],
          "conversao_estimada": "[Estime o ganho com base nos números atuais, ex: +35% a +60%]"
        }
      }
      Retorne apenas o JSON puro, sem formatação markdown.
    `;

    const userPrompt = `
      Lead: ${lead.nome_empresa} | Contato: ${lead.nome} (${lead.cargo})
      Gargalo Relatado: ${lead.gargalo} | Ponto Crítico: ${lead.respostas?.dor || 'N/A'}
      Ecossistema: ${lead.ferramental} | Urgência: ${lead.urgencia}
      Canal principal de entrada de clientes: ${lead.respostas?.canal_principal || 'Não informado'}
      Quem vende hoje: ${lead.respostas?.quem_vende || 'Não informado'}
      Tempo de resposta declarado ao lead: ${lead.respostas?.tempo_resposta_declarado || 'Não informado'}

      --- DADOS FINANCEIROS (FP&A) ---
      Faturamento Base: ${lead.faturamento}
      Leads/Oportunidades por Mês: ${lead.leads_mes || lead.respostas?.leads_mensais || 'Não informado / Não sabe'}
      Taxa de Conversão Atual: ${lead.taxa_conversao || lead.respostas?.taxa_conversao || 'Não informado / Não sabe'}
      Ticket Médio: ${lead.ticket_medio || lead.respostas?.ticket_medio || 'Não informado / Não sabe'}
      Horas Gastas em Tarefas Manuais: ${lead.horas_manuais || lead.respostas?.horas_manuais || 'Não informado / Não sabe'}
      
      Contexto do Site: ${siteContext}
    `;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.7 }),
    });

    const parsedResponse = JSON.parse((await openAiResponse.json()).choices[0].message.content);
    
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    await supabase.from("leads_assessment").update({ analise_ai: parsedResponse.emailHtml, deck_data: parsedResponse.deckData, status: "analisado" }).eq("id", lead.id);

    const deckUrl = `https://agenciacamargo.com/deck/${slug}/${lead.id}`;
    const leadPhone = normalizeBrPhone(lead.whatsapp);
    const r = lead.respostas ?? {};

    const sendEmail = async () => {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        console.warn("[triagem-lead] E-mail não enviado: RESEND_API_KEY ausente.");
        return;
      }
      const emailBody = `
        ${parsedResponse.emailHtml}
        <br><br>
        ${leadPhone ? `<p style="font-family: sans-serif;"><b>WhatsApp do lead:</b> <a href="https://wa.me/${leadPhone}">https://wa.me/${leadPhone}</a></p>` : ""}
        <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">
          <a href="${deckUrl}" style="background-color: #000000; color: #D4AF37; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #D4AF37; display: inline-block; font-family: sans-serif;">Visualizar Diagnóstico de IA</a>
        </td></tr></table>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: "Agência Camargo <contato@agenciacamargo.com>", to: "contato@agenciacamargo.com", subject: `🚨 Diagnóstico IA: ${lead.nome_empresa || lead.nome}`, html: emailBody }),
      });
      if (!res.ok) console.error("[triagem-lead] Falha ao enviar e-mail:", res.status, await res.text());
    };

    const sendWhatsApp = async () => {
      const text = [
        `🚨 Novo diagnóstico: ${lead.nome_empresa || lead.nome}`,
        `Contato: ${lead.nome} (${show(lead.cargo)})`,
        `Faturamento: ${show(lead.faturamento)} | Gargalo: ${show(lead.gargalo)}`,
        `Leads/mês: ${show(r.leads_mensais)} | Conversão: ${showPercent(r.taxa_conversao)} | Ticket: ${show(r.ticket_medio, "R$ ")}`,
        `Tempo de resposta: ${show(r.tempo_resposta_declarado)} | Urgência: ${show(lead.urgencia)}`,
        leadPhone ? `WhatsApp do lead: https://wa.me/${leadPhone}` : `E-mail do lead: ${show(lead.email)}`,
        `Dossiê: ${deckUrl}`,
      ].join("\n");
      await notifyAdminWhatsApp(text);
    };

    // E-mail e WhatsApp são independentes: se um falhar, o outro segue.
    const results = await Promise.allSettled([sendEmail(), sendWhatsApp()]);
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`[triagem-lead] ${i === 0 ? "E-mail" : "WhatsApp"} falhou:`, result.reason);
      }
    });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
