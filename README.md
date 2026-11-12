# Pesquisa AI First

Diagnóstico executivo que estima, **em reais por mês**, quanto uma empresa deixa de ganhar com processos manuais (por exemplo, leads que esfriam por demora no atendimento). O visitante responde um formulário em etapas e recebe o resultado com a comparação antes e depois da automação.

É a camada de **Tração** do Método AC da [Agência Camargo](https://agenciacamargo.com): um funil que entrega valor antes de pedir uma reunião. O estudo de caso completo está em [casos-de-estudo](https://github.com/matheusmmcamargo/casos-de-estudo).

## O que tem aqui

- **Formulário em etapas** com resultado e apresentação (`src/pages`, `src/components/AssessmentForm.tsx`).
- **Motor financeiro** isolado da interface (`src/lib/financialEngine.ts`), com testes (`src/lib/__tests__`).
- **Rastreamento próprio de funil** em tabela do Supabase, sem scripts de terceiros (`src/lib/track.ts`).
- **Página de privacidade** e consentimento (LGPD).
- **Edge Functions** de triagem do lead e aviso ao comercial (`supabase/functions`).
- **Migrações versionadas** do banco (`supabase/migrations`).

## Stack

React 19, TypeScript, Vite, Tailwind CSS 3, React Router, Supabase (PostgreSQL, RLS, Edge Functions).

## Decisões técnicas

- **Cálculo fora dos componentes.** O motor financeiro é uma função pura, testável sem abrir o navegador.
- **Escrita pública só por RPC.** A tabela de leads tem RLS ligada e nenhuma policy aberta. O visitante anônimo chama apenas funções específicas (`pesquisa_submit_lead`), nunca grava direto.
- **Só a chave anônima no navegador.** A chave `service_role` fica restrita às Edge Functions.
- **Eventos de funil no próprio banco**, para medir onde as pessoas desistem sem depender de ferramenta externa.

## Como rodar

```bash
git clone https://github.com/matheusmmcamargo/pesquisa-ai-first.git
cd pesquisa-ai-first
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

Outros comandos:

```bash
npm run test    # testes do motor financeiro
npm run lint
npm run build
```

Para criar o banco, aplique as migrações de `supabase/migrations` no SQL Editor do seu projeto, na ordem dos nomes dos arquivos.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do projeto |

Sem elas o app abre, mas o envio do formulário fica desativado.

## Deploy

Hospedagem estática: `npm run build`, limpar `public_html` preservando o `.htaccess` e enviar o conteúdo de `dist/`.

## Licença

MIT. Veja [LICENSE](LICENSE).
