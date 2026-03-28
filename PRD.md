# PRD — BriefForge v2.0

## Product Requirements Document
**Versão:** 2.0  
**Data:** 27/03/2026  
**Autor:** Victor (Pouco Código)  
**Status:** Ready for Development

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Nome
**BriefForge** — De caos para estratégia em minutos.

### 1.2 One-liner
Ferramenta de IA que transforma inputs bagunçados de clientes em briefings estruturados e auditados — com link compartilhável para o cliente preencher o que falta, eliminando o vai-e-volta que mata a produtividade de agências.

### 1.3 Problema Central
**33% do orçamento de marketing é desperdiçado por briefings ruins** (Better Briefs Project). 80% dos clientes acham que escrevem bons briefs — apenas 10% das agências concordam.

Mas o problema real não é só estruturar a informação. É **conseguir a informação que falta**. O account sabe que o brief está incompleto. O que ele não tem é uma forma eficiente de voltar pro cliente e extrair exatamente o que precisa, sem parecer incompetente e sem gerar 15 emails de ida e volta.

A pesquisa VanPro 2025 confirma que a carência de processos estruturados e a instabilidade operacional são as maiores dores das agências brasileiras. 57% dos times criativos passam por 3-5 versões antes da aprovação final. A causa raiz: o brief não tinha o que precisava ter, e ninguém teve um mecanismo eficiente pra completá-lo.

### 1.4 Solução
BriefForge opera em **dois momentos distintos**:

**Momento 1 — O Account (interno)**
Recebe qualquer input caótico e executa três operações:
1. **EXTRAI** — Identifica e estrutura as informações do texto bagunçado
2. **AUDITA** — Analisa lacunas, contradições e riscos
3. **GERA** — Entrega brief com score de qualidade + link compartilhável

**Momento 2 — O Cliente (externo)**
Recebe um link com o brief parcial e vê exatamente o que falta preencher, com linguagem simples e orientação contextual. Preenche, e o brief atualiza para o account em tempo real.

### 1.5 Diferencial Competitivo
- **Processador de caos** — aceita qualquer formato de input (não é formulário)
- **Brief Vivo** — link compartilhável onde o cliente completa as lacunas (nenhum outro candidato vai ter isso)
- **IA como auditor estratégico** — detecta contradições, não só preenche campos
- **Streaming progressivo** — brief aparece campo a campo em tempo real (Vercel AI SDK)
- **Duas personas, um produto** — account E cliente usam a mesma ferramenta com views diferentes
- Histórico persistente (Supabase) sem autenticação
- Exportação profissional (PDF + Markdown)
- Bilíngue (PT-BR / EN)

---

## 2. USUÁRIO E CONTEXTO DE USO

### 2.1 Personas

**Persona 1: Account Manager / Gerente de Contas (usuário interno)**
- Momento de uso: Recebe pedido caótico do cliente (áudio, email, WhatsApp)
- Ação: Cola o caos no BriefForge, recebe brief estruturado, compartilha link com cliente
- Necessidade: Não ser o "tradutor manual" entre cliente e criação
- Dor: Perder horas montando briefs que voltam incompletos

**Persona 2: Cliente da Agência (usuário externo)**
- Momento de uso: Recebe link do account com o brief parcial
- Ação: Vê os campos que faltam, com explicações simples, preenche
- Necessidade: Saber exatamente o que a agência precisa, sem jargão técnico
- Dor: Não entender por que a agência pede tanta informação

**Persona 3: Diretor de Criação (usuário interno)**
- Momento de uso: Antes de distribuir o job pro time
- Ação: Abre o brief, valida o score, verifica se tem substância pra criar
- Necessidade: Nunca mais receber brief vago
- Dor: "Algo moderno que salte aos olhos"

### 2.2 Cenário de Uso (Antes vs Depois)

**ANTES:**
> Segunda, 9h. Account recebe áudio de 3 min: "quero uma campanha de Dia dos Pais, algo emocionante, que fale com todo mundo, orçamento é o de sempre".
> Account transcreve no bloco de notas, manda email vago pra criação.
> Terça, criação pergunta: "qual o público? qual o budget? tem referência?"
> Account manda email pro cliente pedindo mais info.
> Quarta, cliente responde metade.
> Quinta, criação entrega algo. Cliente detesta. "Não era isso."
> **4 dias perdidos. Time desmotivado. Margem evaporou.**

**DEPOIS:**
> Segunda, 9h. Account abre BriefForge, cola a transcrição do áudio.
> IA estrutura o brief em segundos (streaming progressivo — campo por campo).
> Score: 52/100. Lacunas: orçamento, público específico, KPIs.
> Account clica "Compartilhar com Cliente" → gera link.
> Manda pro cliente: "Preenchi o que consegui do nosso papo. Falta só esses 3 pontos — leva 5 minutos."
> Cliente abre, vê campos simples, preenche.
> Score sobe pra 87/100. Account recebe notificação.
> Criação recebe brief completo. Entrega na primeira rodada.
> **15 minutos no total. Zero refação. Cliente impressionado com a organização.**

---

## 3. FEATURES E ESCOPO

### 3.1 Core Features (MUST HAVE)

#### F1: Input Livre — O Processador de Caos
- Textarea grande e generosa (hero da home)
- Aceita: transcrição de áudio, email colado, notas de reunião, mensagem de WhatsApp, texto livre
- Placeholder contextual com exemplos do que colar
- Sem formulário rígido — a IA extrai a estrutura
- Botão único: "Forjar Brief" 🔥

#### F2: Motor de IA — Extração + Auditoria + Scoring (Streaming)
- **Vercel AI SDK** com `streamObject` + schema Zod
- Chama OpenRouter API (server-side, chave protegida)
- Output streamed campo a campo para o frontend
- Prompt system que atua como estrategista sênior de agência:
  - Extrai campos estruturados do caos
  - Identifica lacunas (missing/partial/complete)
  - Detecta contradições (público vs tom, prazo vs escopo vs budget)
  - Sugere melhorias específicas (não genéricas)
- **10 campos do brief:**
  1. Contexto / Background
  2. Objetivo (push pra SMART)
  3. Público-alvo (demográfico + comportamental)
  4. Mensagem principal (single-minded proposition)
  5. Tom de voz
  6. Entregáveis (formatos, canais, specs)
  7. Orçamento
  8. Prazo e marcos
  9. KPIs de sucesso
  10. Referências / Inspirações
- **Score de qualidade 0-100** calculado com pesos:
  - Completude dos campos (40%)
  - Clareza e especificidade (30%)
  - Coerência interna (20%)
  - Mensurabilidade dos KPIs (10%)

#### F3: Visualização do Brief Gerado
- Layout split-view: Brief (esquerda) | Auditoria (direita)
- Cada campo mostra status: ✅ completo | ⚠️ parcial | ❌ ausente
- Score display animado (contagem de 0 ao valor final)
- Campos aparecem com staggered animation conforme streaming
- Painel de auditoria com:
  - Lista de lacunas com severidade (critical/warning)
  - Contradições detectadas
  - Nota geral da IA

#### F4: Editor Inline
- Cada campo do brief é editável (clica pra expandir/editar)
- Botão "Re-auditar" — IA reavalia o brief editado, score atualiza
- Pode adicionar informações a campos missing

#### F5: Brief Vivo — Link Compartilhável (⭐ DIFERENCIAL)
- Botão "Compartilhar com Cliente" gera link público único
- **Tela pública do cliente** (rota: `/share/[briefId]`):
  - Mostra APENAS os campos com status ⚠️ ou ❌
  - Linguagem simplificada (sem jargão de agência)
  - Cada campo tem explicação contextual:
    - "Orçamento" → "Quanto sua empresa pode investir neste projeto? Mesmo um range aproximado (ex: R$5-10mil) nos ajuda a recomendar os melhores canais."
    - "Público-alvo" → "Quem você quer atingir? Pense na pessoa que compraria seu produto. Idade, onde mora, o que faz..."
  - Design limpo, mobile-friendly, sem cadastro
  - Campos preenchidos salvam direto no Supabase
- **Real-time para o account:**
  - Supabase Realtime subscription (ou polling 5s como fallback)
  - Account vê campos sendo preenchidos pelo cliente ao vivo
  - Score atualiza conforme cliente preenche
  - Badge visual: "Cliente preencheu 2 de 3 campos pendentes"

#### F6: Exportações
- **PDF estilizado** — Layout profissional, inclui:
  - Brief completo com todos os campos
  - Score de qualidade
  - Seção "Pendências" (se houver campos still missing)
  - Seção "Checklist para Criação" (resumo operacional: o que produzir, pra quem, em qual tom, deadline)
- **Markdown** — Copy to clipboard formatado (pra Notion, Google Docs)

#### F7: Histórico de Briefs (Supabase)
- Auto-save de cada brief gerado
- Lista com: título, data, score, status (draft/shared/complete)
- Reabrir e editar qualquer brief
- Anonymous ID persistente (localStorage → Supabase)

#### F8: Bilíngue (PT-BR / EN)
- Toggle no header
- IA responde no idioma selecionado
- Interface traduzida
- Default: PT-BR (browser locale detection)

### 3.2 Nice-to-Have (se sobrar tempo)

#### F9: Templates de Brief por Tipo de Job
- Campanha 360, Social Media, Landing Page, Vídeo, Evento
- Ajusta campos e peso do scoring por tipo

#### F10: Notificação por Email
- Quando o cliente preenche, account recebe email simples
- Implementação: Supabase Edge Function + Resend

---

## 4. ARQUITETURA TÉCNICA

### 4.1 Stack Definida

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | **Next.js 14+ (App Router)** | API Routes server-side (protege chaves), SSR, deploy perfeito na Vercel |
| UI | **Tailwind CSS + shadcn/ui** | Componentes acessíveis, design system rápido, customizável |
| Linguagem | **TypeScript** | Type safety em todo o projeto |
| AI Streaming | **Vercel AI SDK (`ai` package)** | `streamObject` com schema Zod, parsing progressivo nativo |
| Schema | **Zod** | Validação de tipos para o output da IA + schema do streamObject |
| IA Provider | **OpenRouter API** | Flexibilidade de modelos, server-side via API Route |
| Database | **Supabase (PostgreSQL)** | Free tier, Realtime subscriptions, Row Level Security, SDK JS |
| Real-time | **Supabase Realtime** | Subscription pra atualizar brief quando cliente preenche (fallback: polling 5s) |
| PDF | **@react-pdf/renderer** | Geração client-side, layout customizável em React |
| Deploy | **Vercel** | Zero-config pra Next.js, edge functions, preview deploys |
| i18n | **Context customizado** | Leve, sem dependência extra, dicionário PT/EN |
| Motion | **Framer Motion** | Animações de entrada dos campos, score counter, transitions |

### 4.2 Estrutura de Pastas

```
briefforge/
├── app/
│   ├── layout.tsx                  # Root layout (providers, fonts, theme)
│   ├── page.tsx                    # Home — input livre + briefs recentes
│   ├── brief/
│   │   └── [id]/
│   │       └── page.tsx            # Brief view/edit (account)
│   ├── share/
│   │   └── [id]/
│   │       └── page.tsx            # ⭐ Tela pública do cliente (Brief Vivo)
│   ├── history/
│   │   └── page.tsx                # Lista de briefs salvos
│   └── api/
│       ├── generate/
│       │   └── route.ts            # POST — streamObject via Vercel AI SDK + OpenRouter
│       ├── audit/
│       │   └── route.ts            # POST — re-audita brief editado
│       └── brief/
│           └── [id]/
│               └── route.ts        # GET/PATCH — CRUD do brief (pra tela do cliente)
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── brief-input.tsx             # Textarea de input livre (home)
│   ├── brief-view.tsx              # Visualização completa do brief (account)
│   ├── brief-field.tsx             # Campo individual do brief (editável)
│   ├── brief-client-view.tsx       # ⭐ View simplificada do cliente
│   ├── client-field.tsx            # ⭐ Campo pra cliente preencher (linguagem simples)
│   ├── score-display.tsx           # Score circular animado
│   ├── audit-panel.tsx             # Painel lateral de auditoria
│   ├── field-status-badge.tsx      # Badge ✅ ⚠️ ❌
│   ├── export-menu.tsx             # Dropdown de exportação (PDF, MD)
│   ├── brief-card.tsx              # Card na lista de histórico
│   ├── share-button.tsx            # ⭐ Botão de compartilhar + gera link
│   ├── realtime-indicator.tsx      # ⭐ Indicador "cliente está preenchendo..."
│   ├── language-toggle.tsx         # Switch PT/EN
│   ├── theme-toggle.tsx            # Switch dark/light
│   └── header.tsx                  # Header com logo, nav, toggles
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client
│   │   ├── server.ts               # Supabase server client (API Routes)
│   │   └── realtime.ts             # Hook de subscription pra brief updates
│   ├── ai/
│   │   ├── openrouter.ts           # OpenRouter provider config pra Vercel AI SDK
│   │   ├── prompts.ts              # System prompts (generate + audit)
│   │   └── schema.ts               # Zod schema do brief (usado no streamObject)
│   ├── scoring.ts                  # Lógica de cálculo do score (client-side)
│   ├── pdf.ts                      # Geração de PDF
│   ├── markdown.ts                 # Geração de Markdown
│   ├── types.ts                    # TypeScript interfaces globais
│   └── i18n/
│       ├── context.tsx             # Provider de idioma
│       ├── pt-BR.ts                # Dicionário português
│       └── en.ts                   # Dicionário inglês
├── hooks/
│   ├── use-anonymous-id.ts         # Gera/persiste ID anônimo no localStorage
│   ├── use-brief-stream.ts         # Hook que usa useObject do Vercel AI SDK
│   ├── use-brief-realtime.ts       # ⭐ Hook de Supabase Realtime pra updates do cliente
│   └── use-locale.ts               # Hook de idioma
├── styles/
│   └── globals.css                 # Tailwind base + CSS variables + fonts
├── supabase/
│   └── migrations/
│       └── 001_create_briefs.sql
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.3 Schema do Banco (Supabase)

```sql
CREATE TABLE briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  
  -- Input original
  raw_input TEXT NOT NULL,
  
  -- Brief estruturado (10 campos, cada um com content + status)
  structured_brief JSONB NOT NULL DEFAULT '{}',
  
  -- Auditoria
  audit_results JSONB DEFAULT '{}',
  
  -- Scoring
  score INTEGER DEFAULT 0,
  field_scores JSONB DEFAULT '{}',
  
  -- Metadata
  title TEXT,
  language TEXT DEFAULT 'pt-BR',
  status TEXT DEFAULT 'draft',          -- draft | shared | complete
  share_enabled BOOLEAN DEFAULT false,  -- ⭐ se o link público está ativo
  
  -- Client contributions (⭐ Brief Vivo)
  client_inputs JSONB DEFAULT '{}',     -- campos preenchidos pelo cliente
  client_last_seen TIMESTAMPTZ,         -- quando o cliente abriu o link por último
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_briefs_anonymous_id ON briefs(anonymous_id);
CREATE INDEX idx_briefs_share_enabled ON briefs(id) WHERE share_enabled = true;

-- RLS
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Account pode CRUD seus próprios briefs
CREATE POLICY "owner_select" ON briefs FOR SELECT
  USING (anonymous_id = coalesce(current_setting('request.headers', true)::json->>'x-anonymous-id', ''));

CREATE POLICY "owner_insert" ON briefs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "owner_update" ON briefs FOR UPDATE
  USING (anonymous_id = coalesce(current_setting('request.headers', true)::json->>'x-anonymous-id', ''));

-- ⭐ Cliente pode ler e atualizar briefs compartilhados (somente client_inputs)
CREATE POLICY "shared_select" ON briefs FOR SELECT
  USING (share_enabled = true);

CREATE POLICY "shared_update" ON briefs FOR UPDATE
  USING (share_enabled = true)
  WITH CHECK (share_enabled = true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE briefs;
```

**Nota pragmática sobre RLS:** Para o MVP/case, a approach mais segura é usar o Supabase client com anon key + filtros `.eq()` nas queries, sem depender de headers custom no RLS. O RLS acima é o ideal; na implementação, se der problema, degradar pra filtro client-side é aceitável e deve ser documentado como limitação consciente no README.

### 4.4 Vercel AI SDK — Configuração do Streaming

#### Schema Zod (lib/ai/schema.ts)
```typescript
import { z } from 'zod';

const fieldSchema = z.object({
  content: z.string().describe('Conteúdo extraído ou gerado para este campo'),
  status: z.enum(['complete', 'partial', 'missing']).describe('Status de completude'),
  suggestion: z.string().optional().describe('Sugestão de melhoria se partial/missing'),
});

export const briefSchema = z.object({
  title: z.string().describe('Título curto e descritivo do projeto'),
  fields: z.object({
    context: fieldSchema.describe('Contexto: por que esse projeto existe agora'),
    objective: fieldSchema.describe('Objetivo: o que precisa acontecer (SMART)'),
    audience: fieldSchema.describe('Público-alvo: quem (demográfico + comportamental)'),
    message: fieldSchema.describe('Mensagem principal: a única coisa que a audiência deve lembrar'),
    tone: fieldSchema.describe('Tom de voz: personalidade da comunicação'),
    deliverables: fieldSchema.describe('Entregáveis: formatos, canais, especificações'),
    budget: fieldSchema.describe('Orçamento: valor disponível e restrições'),
    timeline: fieldSchema.describe('Prazo: deadlines e marcos de aprovação'),
    kpis: fieldSchema.describe('KPIs: como será medido o resultado'),
    references: fieldSchema.describe('Referências: o que o cliente gosta e não gosta'),
  }),
  audit: z.object({
    gaps: z.array(z.object({
      field: z.string(),
      severity: z.enum(['critical', 'warning']),
      suggestion: z.string(),
    })),
    contradictions: z.array(z.object({
      description: z.string(),
      fields: z.array(z.string()),
    })),
    overall_note: z.string(),
  }),
  score: z.number().min(0).max(100).describe('Score geral de qualidade do brief'),
});
```

#### API Route (app/api/generate/route.ts)
```typescript
import { streamObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';  
// ou: usar fetch manual pra OpenRouter com streaming
import { briefSchema } from '@/lib/ai/schema';
import { generateSystemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const { rawInput, language } = await req.json();

  const result = streamObject({
    model: openrouter('anthropic/claude-sonnet-4'), // ou outro modelo
    schema: briefSchema,
    system: generateSystemPrompt(language),
    prompt: rawInput,
  });

  return result.toTextStreamResponse();
}
```

#### Frontend Hook (hooks/use-brief-stream.ts)
```typescript
import { useObject } from '@ai-sdk/react';  
import { briefSchema } from '@/lib/ai/schema';

export function useBriefStream() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate',
    schema: briefSchema,
  });

  return { brief: object, generate: submit, isLoading, error };
}
```

### 4.5 Prompt Engineering

```
ROLE: Você é um estrategista sênior de agência de publicidade com 20 anos de experiência auditando briefings de campanhas.

CONTEXT: Você vai receber um texto bruto — pode ser uma transcrição de áudio, um email, uma mensagem de WhatsApp, ou notas de reunião. Esse texto contém (ou deveria conter) as informações para um briefing de campanha/projeto de marketing.

TASK: Execute TRÊS operações simultâneas:

1. EXTRAÇÃO — Para cada um dos 10 campos do brief, extraia as informações presentes no texto.
   - Se a informação está clara e suficiente: status = "complete"
   - Se a informação existe mas é vaga ou incompleta: status = "partial", e escreva uma suggestion específica do que falta
   - Se a informação não existe no texto: status = "missing", e escreva uma suggestion do que perguntar ao cliente

2. AUDITORIA — Analise o brief como um todo e identifique:
   - Gaps: campos missing ou partial que vão causar problemas (severity: critical se impede o trabalho, warning se causa retrabalho)
   - Contradições: inconsistências entre campos (ex: "público jovem Gen Z" + "tom formal e corporativo")
   - Nota geral: um parágrafo com sua avaliação honesta do brief

3. SCORING — Atribua um score de 0-100:
   - Completude (40%): quantos campos estão complete
   - Clareza (30%): quão específica é a informação (não aceite "todo mundo" como público)
   - Coerência (20%): os campos fazem sentido juntos
   - Mensurabilidade (10%): os KPIs são concretos e rastreáveis

REGRAS INVIOLÁVEIS:
- NUNCA invente informações que não estão no texto. Se não foi mencionado, marque como "missing".
- Seja ESPECÍFICO nas sugestões. "Defina melhor" é proibido. "Especifique faixa etária (ex: 25-35), localização (ex: capitais do Sudeste) e principal comportamento de compra" é correto.
- Detecte jargão vago: "algo moderno", "que salte aos olhos", "viral", "pra todo mundo", "orçamento de sempre" — e traduza em direcionamento concreto na suggestion.
- O title deve ser descritivo: "Campanha Dia dos Pais - E-commerce Moda Masculina", não "Briefing Novo".

IDIOMA: Responda em {language}.
```

---

## 5. DESIGN E UX

### 5.1 Direção Estética
**Tom: Editorial Refinado** — ferramenta que um Diretor de Criação usaria com orgulho. Não é SaaS genérico; é uma peça de design que comunica competência.

### 5.2 Design Tokens

| Token | Valor Dark | Valor Light | Uso |
|-------|-----------|-------------|-----|
| Font Display | **Instrument Serif** | idem | Títulos, logo, headings |
| Font Body | **Plus Jakarta Sans** | idem | Corpo, labels, UI |
| Font Mono | **IBM Plex Mono** | idem | Scores, dados |
| BG | `#0A0A0A` | `#FAFAF7` | Background |
| Surface | `#141414` | `#FFFFFF` | Cards, containers |
| Surface Hover | `#1E1E1E` | `#F5F5F0` | Hover states |
| Border | `#2A2A2A` | `#E8E6E1` | Bordas sutis |
| Text | `#F5F5F0` | `#1A1A1A` | Texto principal |
| Text Secondary | `#A8A49E` | `#6B6560` | Texto secundário |
| Text Muted | `#706C66` | `#9B9590` | Texto terciário |
| Accent | `#E8553A` | `#E8553A` | CTAs, highlights |
| Success | `#22C55E` | `#16A34A` | Completo, score alto |
| Warning | `#EAB308` | `#CA8A04` | Parcial, score médio |
| Error | `#EF4444` | `#DC2626` | Ausente, score baixo |

### 5.3 Temas e Default
- **Default: Dark mode** (profissionais de agência)
- Toggle light/dark no header
- Tema persiste no localStorage

### 5.4 Wireframes

#### Tela 1: Home (Input) — `/`
```
┌─────────────────────────────────────────────┐
│  🔥 BriefForge    [Histórico] [PT|EN] [🌙] │
├─────────────────────────────────────────────┤
│                                             │
│          De caos para estratégia.           │
│     Cole o pedido do cliente.               │
│     A IA faz o resto.                       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │  "Oi, preciso de uma campanha       │    │
│  │   pro Dia dos Pais, algo            │    │
│  │   emocionante, que fale com         │    │
│  │   todo mundo..."                    │    │
│  │                                     │    │
│  │                          📋 Colar   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│         [ 🔥 Forjar Brief ]                 │
│                                             │
│  ── Recentes ──────────────────────────     │
│  📄 Campanha Dia dos Pais · 87 · 2h        │
│  📄 Lançamento App · 64 · ontem             │
│                                             │
└─────────────────────────────────────────────┘
```

#### Tela 2: Brief (Account View) — `/brief/[id]`
```
┌─────────────────────────────────────────────┐
│  ← Voltar   Campanha Dia dos Pais           │
│             Score: ████████░░ 87/100         │
│             [📤 Compartilhar] [📄 Exportar] │
├────────────────────┬────────────────────────┤
│ BRIEF              │ AUDITORIA              │
│                    │                        │
│ ✅ Contexto        │ ⚠️ 2 lacunas           │
│ Campanha sazonal   │                        │
│ Dia dos Pais 2026  │ ❌ Orçamento (crítico) │
│ para e-commerce    │ "Defina valor ou range │
│ de moda masculina  │  R$X-Y. Sem isso não   │
│ [editar]           │  dá pra planejar mídia"│
│                    │                        │
│ ✅ Objetivo        │ ⚠️ KPIs (warning)      │
│ Aumentar vendas em │ "Objetivo fala em      │
│ 20% no canal       │  vendas mas sem meta   │
│ digital durante    │  numérica. Sugiro:     │
│ período sazonal    │  ROAS mínimo de 4x"    │
│ [editar]           │                        │
│                    │ ✅ 0 contradições       │
│ ⚠️ Público-alvo   │                        │
│ "Pais millennials" │ ───────────────────    │
│ Falta: localização │ 💡 Brief sólido mas    │
│ e comportamento    │ precisa de budget e    │
│ [editar]           │ KPIs concretos pra     │
│                    │ viabilizar a campanha  │
│ ❌ Orçamento       │                        │
│ Não informado      │ 🟢 Cliente preencheu   │
│ [preencher]        │ 1 de 3 campos ⏳       │
│                    │                        │
├────────────────────┴────────────────────────┤
│ [📄 PDF] [📋 Markdown] [🔄 Re-auditar]     │
└─────────────────────────────────────────────┘
```

#### Tela 3: Brief Vivo (Client View) — `/share/[id]` ⭐
```
┌─────────────────────────────────────────────┐
│  🔥 BriefForge                              │
│  Campanha Dia dos Pais                      │
├─────────────────────────────────────────────┤
│                                             │
│  Olá! Sua agência precisa de algumas        │
│  informações para dar vida ao seu projeto.  │
│  Leva menos de 5 minutos. 🙏                │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 💰 Orçamento                        │    │
│  │                                     │    │
│  │ Quanto sua empresa pode investir    │    │
│  │ neste projeto? Mesmo um valor       │    │
│  │ aproximado nos ajuda muito.         │    │
│  │                                     │    │
│  │ [R$ 5.000 - R$ 10.000          ]   │    │
│  │                                     │    │
│  │                         [✓ Salvar]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 👥 Público-alvo (complementar)      │    │
│  │                                     │    │
│  │ A agência já identificou: "Pais     │    │
│  │ millennials". Pode complementar     │    │
│  │ com localização e perfil?           │    │
│  │                                     │    │
│  │ [São Paulo e Rio, classe B, com... ]│    │
│  │                                     │    │
│  │                         [✓ Salvar]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📊 Como medir o sucesso?            │    │
│  │                                     │    │
│  │ O que significaria "deu certo"      │    │
│  │ pra você? Vendas, leads, alcance?   │    │
│  │                                     │    │
│  │ [Quero pelo menos 200 vendas no...] │    │
│  │                                     │    │
│  │                         [✓ Salvar]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ───────────────────────────────────────    │
│  ✅ 1 de 3 campos preenchidos               │
│  Obrigado! Cada campo salvo ajuda sua       │
│  agência a entregar um trabalho melhor.     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Tela 4: Histórico — `/history`
```
┌─────────────────────────────────────────────┐
│  🔥 BriefForge    [+ Novo] [PT|EN] [🌙]    │
├─────────────────────────────────────────────┤
│                                             │
│  Seus Briefs (12)        [Buscar...]        │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Campanha Dia dos Pais               │    │
│  │ ████████░░ 87 · ✅ Complete · 2h    │    │
│  │ 📤 Compartilhado · Cliente: 3/3 ✅  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Lançamento App XYZ                  │    │
│  │ ██████░░░░ 64 · 📤 Shared · ontem  │    │
│  │ Cliente: 1/4 preenchidos ⏳          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Black Friday 2026                   │    │
│  │ █████████░ 92 · ✅ Complete · 3d    │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.5 Micro-interações

- **Forjar Brief:** Animação de "forja" (glow, partículas sutis) durante processamento
- **Streaming:** Campos aparecem com staggered fade-in conforme IA processa
- **Score:** Contagem animada de 0 ao valor final (Framer Motion `animate`)
- **Status badges:** Pulse suave nos campos ❌ pra chamar atenção
- **Brief Vivo:** Indicator sutil "cliente está online" quando o cliente abre o link
- **Save do cliente:** Confetti micro ou checkmark animado ao salvar campo
- **Re-auditar:** Score "pisca" e re-conta quando re-auditado

---

## 6. FLUXOS DO USUÁRIO

### 6.1 Fluxo do Account (Happy Path)
```
1. Acessa briefforge.vercel.app
2. Cola texto caótico na textarea
3. Clica "Forjar Brief" 🔥
4. Vê campos aparecendo progressivamente (streaming)
5. Score aparece: 52/100
6. Revisa auditoria: 3 lacunas (orçamento, público, KPIs)
7. Edita campo "público" com info que sabe → score sobe pra 61
8. Clica "Compartilhar com Cliente" → recebe link
9. Manda link pro cliente via WhatsApp/email
10. Vê campos sendo preenchidos pelo cliente em tempo real
11. Score sobe: 61 → 74 → 87
12. Exporta PDF com brief completo
13. Envia pra criação
```

### 6.2 Fluxo do Cliente
```
1. Recebe link do account (WhatsApp/email)
2. Abre no celular (mobile-first)
3. Vê mensagem acolhedora + 3 campos pra preencher
4. Cada campo tem explicação simples do porquê
5. Preenche campo 1 → clica salvar → checkmark ✅
6. Preenche campo 2 → salvar → ✅
7. Preenche campo 3 → salvar → ✅
8. Vê "Obrigado! Seu brief está completo." 🎉
9. Fecha a aba. Fim. Sem conta, sem nada.
```

---

## 7. CRONOGRAMA (3 DIAS)

### Dia 1 — Sexta 28/03: Foundation + Core IA
**Meta: Input → Brief gerado com streaming funcionando**

| Hora | Tarefa |
|------|--------|
| Manhã | Setup: Next.js + Tailwind + shadcn/ui + TypeScript + Supabase |
| Manhã | Schema Zod do brief + System prompt v1 |
| Manhã | API Route `/api/generate` com Vercel AI SDK + OpenRouter |
| Tarde | Tela Home: textarea + botão + Forjar Brief |
| Tarde | Hook `useObject` + rendering progressivo dos campos |
| Tarde | Tela `/brief/[id]`: visualização split-view (brief + auditoria) |
| Noite | Score display + field status badges (✅⚠️❌) |
| Noite | Supabase: save do brief gerado + anonymous ID |

**Entregável: Pode colar texto, IA gera brief com streaming, vê resultado com score.**

### Dia 2 — Sábado 29/03: Brief Vivo + History
**Meta: Link compartilhável funcionando + histórico**

| Hora | Tarefa |
|------|--------|
| Manhã | Tela `/share/[id]`: view do cliente (campos missing com linguagem simples) |
| Manhã | API Route PATCH pra cliente salvar campos |
| Manhã | Supabase Realtime: account vê updates do cliente ao vivo |
| Tarde | Botão "Compartilhar" + copia link + modal de compartilhamento |
| Tarde | Editor inline dos campos (account) |
| Tarde | Re-auditar: API Route `/api/audit` + score update |
| Noite | Tela `/history`: lista de briefs + status + score |
| Noite | CRUD completo: criar, listar, reabrir, deletar |

**Entregável: Fluxo completo Account → Cliente → Brief atualizado em tempo real.**

### Dia 3 — Domingo 30/03: Polish + Export + Ship
**Meta: Produto polido, exportações, bilíngue, deploy**

| Hora | Tarefa |
|------|--------|
| Manhã | Exportação PDF (react-pdf ou jsPDF) |
| Manhã | Exportação Markdown (copy to clipboard) |
| Manhã | Bilíngue: dicionário PT/EN + toggle + IA responde no idioma |
| Tarde | Micro-animações: streaming reveal, score counter, transitions |
| Tarde | Dark/Light mode polido |
| Tarde | Responsivo: testar tela do cliente em mobile |
| Noite | Deploy Vercel + testar tudo em produção |
| Noite | README.md final |
| Noite | Testar fluxo completo end-to-end (account + cliente em 2 abas) |

**Entregável: Produto final no ar, README entregue.**

---

## 8. README — ESTRUTURA

```markdown
# 🔥 BriefForge — De caos para estratégia

## O Problema
33% do orçamento de marketing é desperdiçado por briefings ruins.
[O gap de percepção. O ciclo de refação. O custo real.]

## Por Que Briefing (e Não Outra Automação)
[Impacto em cascata. Causa raiz vs sintoma. A dor do account.]

## A Solução
[Processador de caos + Brief Vivo. Como funciona em 30 segundos.]

## O Diferencial: Brief Vivo
[Por que o link compartilhável muda tudo. O gargalo real é conseguir a informação.]

## Quem Usa e Quando
[3 personas. Cenário antes/depois. Momento exato da rotina.]

## Stack e Decisões Técnicas
[Tabela com justificativa. Por que streaming. Por que Supabase Realtime.]

## Screenshots / Demo
[GIF do fluxo: input → streaming → share → cliente preenche → score sobe]

## Como Rodar Localmente
[git clone, env vars, npm run dev]

## Roadmap (Se Fosse Produto Real)
[Templates por tipo de job. Integrações Slack/Notion. Analytics de briefs.]

## Autor
[Victor — dev, co-founder, entusiasta de IA aplicada a processos reais]
```

---

## 9. RISCOS E MITIGAÇÕES (Atualizado)

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| OpenRouter streaming não funciona com Vercel AI SDK | Média | Alto | Testar no dia 1 cedo. Fallback: fetch manual com streaming |
| Supabase Realtime instável | Baixa | Médio | Fallback: polling a cada 5s com setInterval |
| RLS sem auth dá problema | Média | Médio | Usar filtro `.eq()` client-side sem RLS. Documentar no README |
| PDF export complexo | Média | Baixo | Fallback: HTML estilizado + window.print() |
| Prompt gera JSON malformado | Média | Alto | Zod parse com safe mode. Retry automático. Mostrar erro amigável |
| 3 dias não é suficiente | Alta | Alto | Prioridade: F1→F2→F3→F5→F7. PDF e bilíngue são os primeiros a cortar |
| Tela do cliente fica feia no mobile | Média | Alto | Testar mobile no dia 2. É a tela mais importante pra impressionar |

**Ordem de corte se faltar tempo:**
1. Corta bilíngue (faz só PT-BR)
2. Corta PDF (mantém só Markdown)
3. Simplifica Realtime (polling ao invés de subscription)
4. NUNCA corta o Brief Vivo (é o diferencial)

---

*PRD v2.0 — Pronto para desenvolvimento. Let's forge.* 🔥