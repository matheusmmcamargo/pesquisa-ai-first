-- Rastreio anônimo do funil da pesquisa (sem dados pessoais)
create table if not exists public.pesquisa_events (
  id bigserial primary key,
  session_id text not null,
  evento text not null,
  step int,
  origem text,
  created_at timestamptz not null default now()
);
alter table public.pesquisa_events enable row level security;
create index if not exists pesquisa_events_created_idx on public.pesquisa_events (created_at desc);

create or replace function public.pesquisa_track(p_session text, p_evento text, p_step int default null, p_origem text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_session is null or length(p_session) > 64 or p_evento is null or length(p_evento) > 40 then return; end if;
  if p_evento not in ('step_view','submit_ok','deck_view') then return; end if;
  insert into public.pesquisa_events(session_id, evento, step, origem) values (p_session, p_evento, p_step, left(p_origem, 200));
end $$;
revoke all on function public.pesquisa_track(text,text,int,text) from public;
grant execute on function public.pesquisa_track(text,text,int,text) to anon, authenticated;
