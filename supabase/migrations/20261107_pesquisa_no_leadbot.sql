-- Módulo "pesquisa" hospedado no projeto Lead Bot (tkvyqlhrfldgsoxeneyf). Prefixo pesquisa_ = isolado das tabelas leadbot_*.
-- Já aplicado em produção em 2026-11-07. Segredo do webhook fica no Vault (nome: pesquisa_webhook_secret), nunca neste arquivo:
--   select vault.create_secret('<segredo-aleatorio>', 'pesquisa_webhook_secret', 'webhook pesquisa -> pesquisa-triagem-lead');

create table if not exists public.pesquisa_leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null, nome_empresa text not null, cargo text, email text not null, whatsapp text, site text,
  faturamento text, segmento text, gargalo text, respostas jsonb not null default '{}'::jsonb,
  ferramental text, urgencia text, analise_ai text, deck_data jsonb, status text not null default 'novo',
  created_at timestamptz not null default now()
);
create index if not exists pesquisa_leads_created_at_idx on public.pesquisa_leads (created_at desc);
create index if not exists pesquisa_leads_status_idx on public.pesquisa_leads (status);
alter table public.pesquisa_leads enable row level security;   -- sem policies: acesso só via RPCs e service_role
revoke all on public.pesquisa_leads from anon, authenticated;

-- RPCs pesquisa_submit_lead(payload jsonb), pesquisa_get_deck(p_id uuid), pesquisa_check_secret(text),
-- gatilho pesquisa_notify_new_lead + trigger pesquisa_leads_notify: ver definições aplicadas no projeto
-- (Supabase > Database > Functions). Mantidas aqui apenas como referência de nomes.
