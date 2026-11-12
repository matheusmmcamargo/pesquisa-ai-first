import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para o Diagnóstico Executivo da Agência Camargo.
 * 
 * SEGURANÇA:
 * - Apenas a chave pública anônima (ANON_KEY) é consumida no cliente frontend.
 * - Toda e qualquer operação de escrita na tabela pesquisa_leads (via RPC pesquisa_submit_lead) está protegida por
 *   Row Level Security (RLS) no Supabase.
 * - A chave SERVICE_ROLE NUNCA deve ser exposta no navegador.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
