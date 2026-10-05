# Histórico do Carro

App pessoal para registrar as despesas e manutenções do carro, ver quanto já foi gasto e planejar gastos futuros. Funciona no celular e no computador (PWA) e guarda tudo na nuvem.

## Funcionalidades

- **Gastos:** cards com descrição, valor, data, categoria, tipo (manutenção, valorização ou rotina), quilometragem opcional e até 5 fotos (ex.: nota fiscal da oficina). Filtros por categoria, tipo e período, com o total acompanhando os filtros.
- **Visão geral:** totais (geral, mês e ano), gráficos por mês, categoria e tipo, últimos gastos e custo por km.
- **Planejados:** gastos que ainda vão acontecer, com valor estimado (ou faixa), prioridade e link. Ao realizar, viram um gasto de verdade.
- **Ajustes:** categorias personalizadas, backup em JSON e conta.

## Stack

React · TypeScript · Vite · Tailwind CSS · Recharts · Supabase (Postgres, Auth e Storage) · Vitest

## Como rodar

Requer Node.js 20+ e um projeto no [Supabase](https://supabase.com) (plano gratuito).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. No Supabase, abra **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas, as regras de acesso (cada usuário só vê os próprios dados), as categorias padrão e o bucket privado das fotos.
3. Copie `.env.local.example` para `.env.local` e preencha com a **Project URL** e a chave **anon public** (*Project Settings → API*). Nunca use a `service_role` no front-end.
4. Em *Authentication → Providers → Email*, desligue **Confirm email** (uso pessoal) e, depois de criar sua conta, desative o cadastro público de novos usuários.
5. Inicie:
   ```bash
   npm run dev
   ```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (checagem de tipos + PWA) |
| `npm test` | testes (Vitest) |
| `npm run lint` | lint (oxlint) |

## Deploy

Qualquer host de sites estáticos serve (Vercel, Netlify, Cloudflare Pages). Defina as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do host.

## Estrutura

```
src/
  components/   cards, formulários, gráficos
  pages/        Visão geral, Gastos, Planejados, Ajustes, Login
  storage/      única camada que fala com o Supabase (dados, fotos, backup)
  lib/          cálculos puros (totais, filtros) com testes
supabase/
  schema.sql    esquema do banco e regras de acesso
```

Detalhes de produto e decisões em [`CLAUDE.md`](CLAUDE.md).

## Licença

[MIT](LICENSE)
