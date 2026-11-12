import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    
    // Ignorar mensagens enviadas por você mesmo ou atualizações de status
    if (payload.data?.key?.fromMe || payload.event !== "messages.upsert") {
      return new Response("Ignorado", { status: 200 });
    }

    const remoteJid = payload.data.key.remoteJid; // Ex: 5514991241181@s.whatsapp.net
    if (!remoteJid || remoteJid.includes("@g.us")) return new Response("Grupo ignorado", { status: 200 });

    const incomingNumber = remoteJid.split('@')[0];
    
    // Estratégia Anti-Nono Dígito: Usar apenas os últimos 8 dígitos para buscar no banco
    const baseNumber = incomingNumber.slice(-8);

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    
    const { data: leads } = await supabase
      .from('leads_assessment')
      .select('nome')
      .ilike('whatsapp', `%${baseNumber}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    const leadName = leads && leads.length > 0 ? leads[0].nome.split(' ')[0] : null;

    const mensagem = leadName 
      ? `Olá, ${leadName}! Obrigado por entrar em contato. Seu diagnóstico está sendo finalizado por nossa Inteligência Artificial e nossa equipe vai avaliar a viabilidade técnica da operação em breve.`
      : `Olá! Obrigado por entrar em contato. Recebemos o seu interesse no Mapeamento de Eficiência. Seu diagnóstico está sendo processado e retornaremos em breve.`;

    // Disparo da resposta via API de WhatsApp (Exemplo Evolution API)
    const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
    const instanceName = Deno.env.get("EVOLUTION_INSTANCE");

    if (evolutionApiUrl && evolutionApiKey && instanceName) {
      await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": evolutionApiKey
        },
        body: JSON.stringify({
          number: remoteJid,
          options: { delay: 1200, presence: "composing" },
          textMessage: { text: mensagem }
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, sdrName: leadName }), { headers: corsHeaders, status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }
});

