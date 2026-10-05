# Histórico do Carro

App pessoal para registrar e acompanhar todas as despesas do carro (combustível, manutenção, melhorias etc.), ver quanto já foi gasto e planejar gastos futuros.

Idioma: interface, textos e mensagens em **português (pt-BR)**. Valores em **R$** (BRL), datas no formato `dd/mm/aaaa`. Código (nomes de variáveis, funções, tipos) em inglês.

## Stack (padrão, pode ser trocada)

- React + TypeScript + Vite
- Estilo: Tailwind CSS
- Gráficos: Recharts
- Uso em **celular e computador**: o app é um **PWA** (instalável na tela inicial do celular) com layout responsivo.
- Persistência e sincronização: **Supabase** (Postgres + login por e-mail, plano gratuito atende). Os dados ficam na nuvem e aparecem igual nos dois dispositivos. Login simples (e-mail + link mágico ou senha) só para proteger os dados, uso individual. Regras de acesso (RLS) garantem que cada usuário só vê os próprios dados.
- Acesso aos dados isolado em uma camada (`src/storage/`) para poder trocar o provedor (ex.: Firebase) sem mexer nas telas.
- Sem cache local por enquanto: o app carrega tudo do Supabase ao abrir (precisa de internet). Modo offline fica como melhoria futura.
- Esquema do banco, regras de acesso (RLS), categorias padrão e bucket de fotos: `supabase/schema.sql` (rodar uma vez no SQL Editor).
- Fotos: Supabase Storage, bucket privado `receipts`, caminho `<user_id>/<image_id>.jpg`.
- Testes: Vitest (focar em cálculos de totais/filtros)

## Funcionalidades

### 1. Cadastro de gastos (cards)
Formulário para adicionar um novo gasto, exibido como card. Campos:
- **Descrição** (obrigatório)
- **Valor** (obrigatório, R$)
- **Data** (obrigatório, padrão hoje)
- **Categoria** (obrigatório, ver abaixo)
- **Tipo**: `manutenção` | `valorização` | `rotina` (ver abaixo)
- **Quilometragem** (opcional): útil para registrar em que km foi feita a troca de óleo, o polimento etc.
- **Observações** (opcional)
- **Fotos** (opcional, até 5): nota fiscal da oficina, peça etc. Reduzidas no cliente (máx. 1600px, JPEG) antes de salvar. Ficam no Supabase Storage (`src/storage/images.ts`); o gasto guarda só os ids em `attachments`. As fotos não entram no backup JSON.

Cards podem ser editados e excluídos (com confirmação).

### 2. Categorias
Padrão: Combustível (posto), Manutenção, Peças, Seguro, IPVA/Licenciamento, Estacionamento/Pedágio, Lavagem/Estética, Multas, Acessórios, Outros.
O usuário pode criar, renomear e remover categorias próprias.

### 3. Tipo do gasto
Separa a natureza do gasto, independente da categoria:
- **Manutenção**: mantém o carro funcionando (troca de óleo, pneus, freios).
- **Valorização**: não é manutenção, mas agrega valor ou conforto (polimento, LED, som, película).
- **Rotina**: custo de uso (combustível, estacionamento, pedágio, seguro, IPVA).

### 4. Aba "Gastos" (total gasto)
- Lista de todos os gastos realizados, mais recentes primeiro
- Filtros: categoria (múltipla), tipo, período (data inicial/final)
- Total gasto reflete os filtros aplicados

### 5. Aba "Visão geral" (dashboard)
- Total gasto no geral, no mês atual e no ano atual
- Gasto por categoria (gráfico de pizza ou barras)
- Gasto por tipo (manutenção x valorização x rotina)
- Evolução mensal (gráfico de barras ou linha)
- Últimos gastos
- Total planejado pendente (vindo da aba Planejados)
- Se houver quilometragem: custo por km

### 6. Aba "Planejados"
Gastos que ainda não aconteceram. Ex.: "trocar farol para LED, média R$ 400".
Campos: descrição, categoria, tipo, **valor estimado** (ou faixa mín–máx), prioridade (baixa/média/alta), observações/link de referência, status (`planejado` | `realizado`).
- Total estimado dos itens planejados
- Ação **"Marcar como realizado"**: converte o item em um gasto real, pré-preenchendo o formulário (o usuário informa o valor real e a data)

## Modelo de dados

```ts
type ExpenseType = 'maintenance' | 'upgrade' | 'routine';

interface Category { id: string; name: string; }

interface Expense {
  id: string;
  description: string;
  amount: number;        // em reais, 2 casas decimais
  date: string;          // ISO yyyy-mm-dd
  categoryId: string;
  type: ExpenseType;
  odometer?: number;     // km
  notes?: string;
  createdAt: string;
}

interface PlannedExpense {
  id: string;
  description: string;
  estimatedAmount: number;
  estimatedMax?: number; // se for faixa de preço
  categoryId: string;
  type: ExpenseType;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  status: 'planned' | 'done';
  expenseId?: string;    // preenchido ao virar gasto real
}
```

## Estrutura sugerida

```
src/
  components/    # cards, formulários, filtros, gráficos
  pages/         # Gastos, VisaoGeral, Planejados
  storage/       # única camada que fala com o Supabase (remote.ts), fotos (images.ts), backup/migração
  lib/           # cálculos puros (totais, agrupamentos, filtros) + testes
  types.ts
```

## Convenções

- Cálculos de totais e agrupamentos ficam em funções puras em `src/lib/`, com testes. Componentes só exibem.
- Formatação de moeda e data centralizada em um único helper (`Intl.NumberFormat` / `Intl.DateTimeFormat` com `pt-BR`).
- Trabalhar valores monetários com cuidado de arredondamento (somar em centavos ou arredondar na exibição).
- Layout responsivo, pensado primeiro para celular (o uso típico é registrar o gasto logo após pagar).
- Não adicionar dependências sem necessidade; manter o projeto simples.
- Dados do usuário nunca são apagados sem confirmação. Incluir exportar/importar JSON como backup, mesmo com os dados na nuvem.
- Chaves e URL do Supabase ficam em variáveis de ambiente (`.env.local`, fora do git). Só a chave pública (anon) vai para o front-end; nunca a `service_role`.

## Comandos

Node instalado via Homebrew; se `node`/`npm` não forem encontrados no shell, usar `export PATH="/opt/homebrew/bin:$PATH"`.
- `npm run dev`: servidor de desenvolvimento
- `npm run build`: build de produção (checagem de tipos + PWA)
- `npm test`: testes (Vitest)
- `npm run lint`: lint (oxlint)

## Fora do escopo (por enquanto)

Múltiplos veículos (desejado no futuro, não agora), contas para outros usuários, modo offline completo, controle de consumo (km/l), lembretes de manutenção por km/data, OCR de notas fiscais. Podem virar fases futuras; o modelo de dados deve facilitar adicionar `carId` depois.

## Perguntas em aberto

- ~~Um carro só ou vários?~~ Decidido: um carro por enquanto, com suporte a vários veículos numa fase futura.
- ~~Sincronização?~~ Decidido: celular + computador, via Supabase e PWA.
- ~~Km?~~ Decidido: campo opcional de quilometragem em qualquer gasto. Controle de consumo (km/l) fica fora por ora.
- ~~Provedor?~~ Decidido: Supabase. O usuário vai criar a conta e o projeto (gratuito); o app só é ligado aos dados depois, com a URL e a chave `anon` em `.env.local`.
