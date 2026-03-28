# CLAUDE.md — BriefForge

Instruções para o Claude Code neste repositório.

## Sobre o projeto

**BriefForge** — De caos para estratégia em minutos.

Ferramenta de IA que transforma inputs bagunçados de clientes em briefings estruturados e auditados, com link compartilhável ("Brief Vivo") para o cliente preencher o que falta. Sem autenticação — tudo funciona via anonymous ID (localStorage) e links públicos.

### Duas personas, um produto

- **Account (interno):** cola texto caótico → IA extrai, audita e gera brief com score → compartilha link com cliente
- **Cliente (externo):** recebe link → vê apenas campos missing/parciais com linguagem simples → preenche → brief atualiza em tempo real

### Core features

1. **Input Livre** — textarea que aceita qualquer formato (transcrição, email, WhatsApp, notas)
2. **Motor de IA** — extração + auditoria + scoring via `streamObject` (Vercel AI SDK) com schema Zod
3. **Brief View** — split-view (brief à esquerda, auditoria à direita) com status por campo (complete/partial/missing)
4. **Editor Inline** — cada campo é editável, com re-auditoria
5. **Brief Vivo** — link compartilhável onde o cliente completa lacunas (diferencial principal)
6. **Exportações** — PDF estilizado + Markdown (copy to clipboard)
7. **Histórico** — auto-save, lista com score/status, reabrir e editar
8. ~~**Bilíngue**~~ — REMOVIDO do escopo (interface apenas PT-BR)

## Regras gerais

- Sempre use `bun` em vez de `npm` ou `npx`
- Prefira TypeScript — nunca crie arquivos `.js` ou `.jsx`
- Execute `bun run build` para verificar erros de tipo antes de considerar uma tarefa concluída
- Execute `bun run lint` antes de commits
- Siga as convenções do Next.js App Router (server components por padrão, "use client" apenas quando necessário)
- Leia `node_modules/next/dist/docs/` antes de usar APIs do Next.js — esta versão (16) tem breaking changes

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 16 (App Router) | API Routes server-side, SSR, deploy Vercel |
| UI | Tailwind CSS 4 + shadcn/ui | Componentes acessíveis, customizáveis |
| Linguagem | TypeScript | Type safety em todo o projeto |
| AI Streaming | Vercel AI SDK (`ai` package) | `streamObject` com schema Zod, parsing progressivo |
| Schema | Zod | Validação de tipos para output da IA + schema do streamObject |
| IA Provider | OpenRouter API | Flexibilidade de modelos, server-side via API Route |
| Banco de dados | Supabase (PostgreSQL) | Free tier, Realtime subscriptions, SDK JS |
| Real-time | Supabase Realtime | Subscription para updates do Brief Vivo (fallback: polling 5s) |
| PDF | @react-pdf/renderer | Geração client-side, layout customizável em React |
| Animações | Framer Motion | Streaming reveal, score counter, transitions |
| ~~i18n~~ | ~~Context customizado~~ | REMOVIDO — interface apenas PT-BR |
| Deploy | Vercel | Zero-config para Next.js |

## Variáveis de ambiente

```
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Estrutura de rotas

### Páginas
- `/` — Home: textarea de input livre + briefs recentes
- `/brief/[id]` — Brief view/edit (account): split-view brief + auditoria
- `/share/[id]` — Brief Vivo: tela pública do cliente (campos missing com linguagem simples)
- `/history` — Lista de briefs salvos com score e status

### API Routes
- `POST /api/generate` — streamObject via Vercel AI SDK + OpenRouter (gera brief do input)
- `POST /api/audit` — re-audita brief editado, recalcula score
- `GET /api/brief/[id]` — retorna dados do brief
- `PATCH /api/brief/[id]` — atualiza brief (edição do account ou input do cliente)

## Estrutura de pastas

```
briefforge/
├── app/
│   ├── layout.tsx                  # Root layout (providers, fonts, theme)
│   ├── page.tsx                    # Home — input livre + briefs recentes
│   ├── brief/[id]/page.tsx         # Brief view/edit (account)
│   ├── share/[id]/page.tsx         # Brief Vivo (cliente)
│   ├── history/page.tsx            # Lista de briefs salvos
│   └── api/
│       ├── generate/route.ts       # POST — streamObject + OpenRouter
│       ├── audit/route.ts          # POST — re-audita brief
│       └── brief/[id]/route.ts     # GET/PATCH — CRUD do brief
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── brief-input.tsx             # Textarea de input livre (home)
│   ├── brief-view.tsx              # Visualização completa do brief (account)
│   ├── brief-field.tsx             # Campo individual do brief (editável)
│   ├── brief-client-view.tsx       # View simplificada do cliente
│   ├── client-field.tsx            # Campo para cliente preencher
│   ├── score-display.tsx           # Score circular animado
│   ├── audit-panel.tsx             # Painel lateral de auditoria
│   ├── field-status-badge.tsx      # Badge de status (complete/partial/missing)
│   ├── export-menu.tsx             # Dropdown de exportação (PDF, MD)
│   ├── brief-card.tsx              # Card na lista de histórico
│   ├── share-button.tsx            # Botão de compartilhar + gera link
│   ├── realtime-indicator.tsx      # Indicador "cliente está preenchendo..."
│   ├── # language-toggle.tsx       # REMOVIDO — sem i18n
│   ├── theme-toggle.tsx            # Switch dark/light
│   └── header.tsx                  # Header com logo, nav, toggles
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client (anon key)
│   │   ├── server.ts               # Supabase server client (service role)
│   │   └── realtime.ts             # Hook de subscription para brief updates
│   ├── ai/
│   │   ├── openrouter.ts           # OpenRouter provider config para Vercel AI SDK
│   │   ├── prompts.ts              # System prompts (generate + audit)
│   │   └── schema.ts               # Zod schema do brief (usado no streamObject)
│   ├── scoring.ts                  # Lógica de cálculo do score (client-side)
│   ├── pdf.ts                      # Geração de PDF
│   ├── markdown.ts                 # Geração de Markdown
│   ├── types.ts                    # TypeScript interfaces globais
│   # i18n/ — REMOVIDO — interface apenas PT-BR
├── hooks/
│   ├── use-anonymous-id.ts         # Gera/persiste ID anônimo no localStorage
│   ├── use-brief-stream.ts         # Hook que usa useObject do Vercel AI SDK
│   ├── use-brief-realtime.ts       # Hook de Supabase Realtime para updates do cliente
│   # use-locale.ts                 # REMOVIDO — sem i18n
└── styles/
    └── globals.css                 # Tailwind base + CSS variables + fonts
```

## Banco de dados (Supabase)

Uma tabela principal: `briefs`

```sql
CREATE TABLE briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  structured_brief JSONB NOT NULL DEFAULT '{}',
  audit_results JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  field_scores JSONB DEFAULT '{}',
  title TEXT,
  language TEXT DEFAULT 'pt-BR',
  status TEXT DEFAULT 'draft',          -- draft | shared | complete
  share_enabled BOOLEAN DEFAULT false,
  client_inputs JSONB DEFAULT '{}',
  client_last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Realtime habilitado na tabela `briefs`
- RLS: owner CRUD via anonymous_id, shared briefs legíveis/editáveis por qualquer um
- Nota pragmática: se RLS via headers der problema, usar filtro `.eq()` client-side e documentar como limitação

Storage bucket (leitura pública):
- `briefforge-exports/` — PDFs exportados (se necessário)

## Arquitetura da IA

- **Sem frameworks de agentes** — toda a lógica vive no system prompt
- Usa `streamObject` (Vercel AI SDK) + schema Zod — NÃO usa `useChat`
- Frontend consome via `useObject` do `@ai-sdk/react`
- Output streamed campo a campo para o frontend
- O prompt atua como **estrategista sênior de agência**:
  - EXTRAI campos estruturados do caos
  - AUDITA lacunas, contradições, riscos
  - SCORES de 0-100 com pesos (completude 40%, clareza 30%, coerência 20%, mensurabilidade 10%)
- **10 campos do brief:** contexto, objetivo (SMART), público-alvo, mensagem principal, tom de voz, entregáveis, orçamento, prazo, KPIs, referências
- Cada campo tem: `content`, `status` (complete/partial/missing), `suggestion`
- Regra: NUNCA inventar informação que não está no input. Missing = missing.
- A IA responde no idioma selecionado

## Design e UX

### Direção estética
**Tom: Editorial Refinado** — ferramenta que um Diretor de Criação usaria com orgulho.

### Fontes
- **Display:** Instrument Serif (títulos, logo, headings)
- **Body:** Plus Jakarta Sans (corpo, labels, UI)
- **Mono:** IBM Plex Mono (scores, dados)

### Design tokens

| Token | Dark | Light |
|-------|------|-------|
| BG | `#0A0A0A` | `#FAFAF7` |
| Surface | `#141414` | `#FFFFFF` |
| Surface Hover | `#1E1E1E` | `#F5F5F0` |
| Border | `#2A2A2A` | `#E8E6E1` |
| Text | `#F5F5F0` | `#1A1A1A` |
| Text Secondary | `#A8A49E` | `#6B6560` |
| Text Muted | `#706C66` | `#9B9590` |
| Accent | `#E8553A` | `#E8553A` |
| Success | `#22C55E` | `#16A34A` |
| Warning | `#EAB308` | `#CA8A04` |
| Error | `#EF4444` | `#DC2626` |

- **Default: Dark mode** (toggle light/dark no header, persiste no localStorage)

### Micro-interações
- Streaming: campos aparecem com staggered fade-in (Framer Motion)
- Score: contagem animada de 0 ao valor final
- Status badges: pulse suave nos campos missing
- Brief Vivo: indicator "cliente está online"
- Save do cliente: checkmark animado
- Re-auditar: score re-conta

## Metodologia TDD (Test-Driven Development)

O projeto segue TDD rigoroso. O ciclo para cada feature é:

1. **RED** — Escrever os testes ANTES do código de produção. Os testes devem falhar.
2. **GREEN** — Implementar o mínimo de código necessário para os testes passarem.
3. **REFACTOR** — Refatorar o código mantendo os testes verdes.

### Regras

- **Nunca escrever código de produção sem ter um teste falhando primeiro**
- **NUNCA burlar, pular, simplificar ou fazer skip de testes TDD — sob nenhuma circunstância**
- **Todos os testes definidos nas specs DEVEM ser implementados por completo, com assertions reais**
- **Proibido**: `test.skip()`, `test.todo()`, assertions vazias, mocks que sempre retornam sucesso sem validação, testes que passam sem testar nada de verdade, reduzir o escopo de um teste para ele passar artificialmente
- **Se um teste falha, corrigir o código de produção — NUNCA alterar o teste para ele passar**
- **Se um teste está difícil de implementar, isso é um sinal para melhorar o design do código, não para simplificar o teste**
- **NUNCA remover, comentar ou desabilitar um teste existente para fazer o build passar**
- **NUNCA usar `@ts-ignore`, `@ts-expect-error` ou `any` para silenciar erros em testes**
- **NUNCA reduzir assertions de um teste (ex: remover expects) para fazê-lo passar**
- **NUNCA criar mocks que retornam dados hardcoded sem validar que foram chamados corretamente**
- **Se todos os testes passam mas o build falha, corrigir o build — não os testes**
- **Cada teste deve ter pelo menos uma assertion (`expect`) que valida comportamento real**
- Cada spec em `/specs/*.md` contém a seção `TDD — Testes` com todos os testes a serem escritos
- Usar `vitest` como test runner + `@testing-library/react` para testes de componentes
- Rodar testes com `bun run test` (vitest) antes de considerar qualquer tarefa concluída
- Testes de API routes: usar request mock (não subir servidor real)
- Testes de DB: mockar Supabase client (testes unitários) — testes de integração são opcionais
- Testes de componentes: renderizar com `@testing-library/react`, testar comportamento (não implementação)
- Nomear arquivos de teste como `__tests__/<path>/<nome>.test.ts(x)`
- Manter cobertura de testes para toda lógica de negócio e componentes interativos

### Comandos de teste

| Comando | Descrição |
|---------|-----------|
| `bun run test` | Rodar todos os testes (vitest) |
| `bun run test:watch` | Testes em modo watch |
| `bun run test:coverage` | Testes com relatório de cobertura |

### Specs com testes definidos

Cada spec em `/specs/` define os testes na seção `TDD — Testes`. Ao implementar uma feature:

1. Leia a spec correspondente em `/specs/`
2. Escreva os testes listados na seção TDD
3. Rode os testes — devem falhar (RED)
4. Implemente o código — testes devem passar (GREEN)
5. Refatore se necessário (REFACTOR)
6. Rode `bun run test` + `bun run build` + `bun run lint`

### Lista de specs (ordem de implementação)

| # | Spec | Arquivo | Testes |
|---|------|---------|--------|
| 1 | Setup & Foundation | `specs/setup_foundation.md` | 6 |
| 2 | Schema & Types | `specs/schema_types.md` | 14 |
| 3 | Database (Supabase) | `specs/database.md` | 9 |
| 4 | Design System | `specs/design_system.md` | 12 |
| 5 | AI Engine (Motor de IA) | `specs/ai_engine.md` | 17 |
| 6 | Scoring | `specs/scoring.md` | 22 |
| 7 | Input Livre (F1) | `specs/input_livre.md` | 21 |
| 8 | Brief View (F3) | `specs/brief_view.md` | 23 |
| 9 | Editor Inline (F4) | `specs/editor_inline.md` | 16 |
| 10 | Brief Vivo (F5) | `specs/brief_vivo.md` | 26 |
| 11 | Exportações (F6) | `specs/exportacoes.md` | 17 |
| 12 | Histórico (F7) | `specs/historico.md` | 14 |
| ~~13~~ | ~~Bilíngue (F8)~~ | ~~`specs/bilingue.md`~~ | ~~16~~ | REMOVIDO |
| | **Total** | | **197** |

## Gestão de tarefas (TASKS.md)

O arquivo `TASKS.md` na raiz do projeto contém todas as tarefas organizadas por spec. Ao trabalhar em uma tarefa:

- `[ ]` — Tarefa pendente (não iniciada)
- `[~]` — Tarefa em progresso (agente trabalhando nela agora)
- `[x]` — Tarefa concluída

**Regras — NUNCA burle estas regras, sob NENHUMA circunstância:**
- Ao iniciar uma tarefa, marcar **imediatamente** como `[~]` no `TASKS.md` ANTES de começar qualquer código
- Ao concluir uma tarefa, marcar **imediatamente** como `[x]` no `TASKS.md` DEPOIS de validar que funciona
- Nunca deixar uma tarefa como `[~]` se não estiver ativamente trabalhando nela
- Nunca pular a atualização do `TASKS.md` — isto é obrigatório em toda transição de estado
- Se múltiplas tarefas forem concluídas em sequência, atualizar cada uma individualmente

## Padrões de Frontend / Design

### Referência de design

O arquivo `reference.html` na raiz é a referência visual do projeto. **Todas as cores do BriefForge (design tokens) são mantidas** — apenas os padrões de layout, tipografia, componentes e interações seguem a referência.

### Padrões extraídos da referência

**Layout:**
- Seções full-width com padding generoso (`py-24 px-6 md:px-12`)
- Containers com `max-w-7xl mx-auto`
- Layouts assimétricos no hero (texto à esquerda + composição visual à direita)
- Seções alternando fundos claros e escuros
- Espaçamento amplo entre blocos (`gap-20`, `gap-16`)

**Tipografia:**
- Headings oversized em serif (`text-6xl` a `text-8xl`), `font-light`, `leading-[0.95]`, `tracking-tight`
- Ênfase mista dentro de headings: spans com `italic`, cor diferente, peso diferente
- Labels pequenos em uppercase com tracking largo (`text-xs font-medium uppercase tracking-widest`)
- Hierarquia clara: serif display (Instrument Serif) → sans body (Plus Jakarta Sans) → mono dados (IBM Plex Mono)

**Componentes:**
- Cards com border-radius grande (`rounded-3xl`, `rounded-2xl`)
- Elementos flutuantes/sobrepostos com rotação leve (`rotate-[-4deg]`, `rotate-[3deg]`) que endireitam no hover (`hover:rotate-0`)
- Glass morphism: `backdrop-blur-sm/md` + `bg-white/60` + `border border-white/40`
- Botões pill-shaped (`rounded-full`) com ícone + texto
- Indicadores de status com dot pulsante (`animate-pulse`)
- Gradient overlays em imagens (`bg-gradient-to-t from-stone-900/60 via-transparent to-transparent`)
- Badges em pill (`rounded-full`, `px-3 py-1`, fundo sutil)
- Sombras grandes e sutis (`shadow-2xl shadow-stone-900/20`)

**Interações:**
- Hover scale em botões/cards (`hover:scale-105`, `active:scale-95`)
- Group hover para componentes compostos
- Transições suaves (`duration-300` a `duration-700`)
- Grayscale que revela cor no hover (`grayscale group-hover:grayscale-0`)
- Translate no hover para ícones de seta (`group-hover:translate-x-1`)

**Elementos decorativos:**
- Texto watermark gigante no fundo (`text-[16vw]`, `opacity-20`, `pointer-events-none`)
- Glows atmosféricos com `blur-3xl` e gradientes sutis
- Ícones decorativos flutuantes

### Regras de componentização

- **Cada elemento visual distinto deve ser um componente separado** — nunca montar tudo inline numa page
- Componentes devem ser granulares: um card, um badge, um indicador, um botão estilizado = componentes separados
- Compor páginas combinando componentes pequenos, não criando mega-componentes
- Componentes de UI base: sempre usar shadcn/ui via MCP (`shadcn` MCP server configurado em `.mcp.json`)
- **Ao construir frontend, SEMPRE consultar o MCP do shadcn** para instalar e usar componentes base antes de criar do zero
- Componentes customizados do projeto ficam em `components/` — componentes shadcn ficam em `components/ui/`
- Props tipadas com TypeScript — interfaces definidas no próprio arquivo do componente (não centralizar em types.ts a menos que compartilhado)

## Padrões de código

- Componentes de UI: usar shadcn/ui — instalar via MCP do shadcn (configurado em `.mcp.json`) ou `bunx shadcn@latest add <component>`
- Streaming de brief: usar `useObject` do `@ai-sdk/react` com `streamObject` no backend — nunca implementar streaming manual
- Supabase client: helper em `lib/supabase/client.ts` (browser, anon key) e `lib/supabase/server.ts` (API routes, service role)
- Anonymous ID: gerar e persistir no localStorage via hook `use-anonymous-id`
- Tratamento de erros nas API routes: retornar `NextResponse.json({ error: "..." }, { status: 4xx })`
- Validação: validar inputs nas API routes (boundary do sistema), confiar em código interno

## Prioridade de features (ordem de corte se faltar tempo)

1. ~~Corta bilíngue (faz só PT-BR)~~ — JÁ CORTADO
2. Corta PDF (mantém só Markdown)
3. Simplifica Realtime (polling ao invés de subscription)
4. **NUNCA corta o Brief Vivo** (é o diferencial)

## Commands

| Command | Descrição |
|---------|-----------|
| `/commit` | Stage all changes e cria commit |
| `/push` | Push da branch atual |
| `/pr` | Cria Pull Request no GitHub |
| `/ship` | Commit + Push + PR |

## Skills relevantes

| Skill | Comando | Quando usar |
|-------|---------|-------------|
| UX Design | `/ux-design` | Design de interfaces e fluxos |
| Marketing Copy | `/marketing-copy` | Copy da landing page |
| SEO Technical | `/seo-technical` | Meta tags, OpenGraph, sitemap |
| Favicon | `/favicon` | Gerar favicons e app icons |

## Segurança

Após implementar features que tocam API routes, banco de dados ou uploads, invocar o agent `security-auditor` para auditar:
- API routes (validação de input, rate limiting)
- Supabase RLS policies
- Upload de arquivos (validação de tipo/tamanho)
- Exposição de dados sensíveis em responses

## Aprendizados

Descobertas feitas durante o desenvolvimento que impactam o projeto. Registre aqui qualquer comportamento inesperado, workaround necessário, ou decisão técnica importante que não é óbvia pelo código.

- **`useObject` no `@ai-sdk/react` v3.x é experimental:** O export é `experimental_useObject`, não `useObject`. Usar `import { experimental_useObject as useObject } from '@ai-sdk/react'`.
