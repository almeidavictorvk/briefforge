# BriefForge

**De caos para estrategia em minutos.**

> Ferramenta de IA que transforma inputs bagunçados de clientes em briefings estruturados, auditados e compartilháveis — sem login, sem fricção.

**[Acessar o BriefForge](https://briefforge-one.vercel.app/)** · [Repositório no GitHub](https://github.com/almeidavictorvk/briefforge) · [Vídeo explicativo da plataforma](https://drive.google.com/file/d/1Frli9uIDkJETZ6Jr49SeFRGf0FqUH5dg/view?usp=sharing)

---

## O problema

Quem trabalha em agência ou consultoria conhece o cenário: o cliente manda um áudio de 7 minutos, três e-mails contraditórios e um PDF com "referências". O Account precisa transformar isso num briefing que faça sentido para o time criativo. Hoje, esse processo leva de 40 minutos a horas — e mesmo assim o brief chega incompleto, com lacunas que só aparecem no meio da execução.

O resultado? Retrabalho, desalinhamento, prazos estourados e aquela reunião que poderia ter sido um brief bem feito.

## A solução

O BriefForge resolve isso em três passos:

1. **Cole o caos.** O Account cola qualquer texto — transcrição de reunião, thread de WhatsApp, e-mail, notas soltas. Não precisa formatar nada.

2. **A IA estrutura e audita.** Em segundos, a IA extrai 10 campos estratégicos (objetivo SMART, público-alvo, tom de voz, KPIs, etc.), identifica o que está faltando, aponta contradições e gera um score de qualidade de 0 a 100.

3. **O cliente completa o que falta.** O Account compartilha um link — o **Brief Vivo** — onde o cliente vê apenas os campos incompletos, com linguagem simples, e preenche. O brief atualiza em tempo real. Sem cadastro, sem app, sem fricção.

---

## Como identifiquei o problema

Vou ser direto: eu não tinha experiência prévia no dia a dia de agências de publicidade. Em vez de inventar uma dor a partir do achismo, usei IA como ferramenta de pesquisa estratégica — e é exatamente isso que defendo como metodologia de trabalho.

**O processo foi assim:**

Comecei pedindo ao Claude (Anthropic) que pesquisasse as principais fricções operacionais de agências e times de marketing. Ele trouxe dados de pesquisas reais — a VanPro 2025 do ecossistema Sinapro/Fenapro, relatórios de produtividade de marketing ops, e análises de mercado sobre gargalos criativos. Em paralelo, usei o Gemini Deep Research pra gerar um documento extenso cruzando tendências de MarTech, dados do Better Briefs Project e o cenário macro de agências no Brasil.

Com esses dois inputs, sentei com o Claude pra fazer o que considero a parte mais importante: **filtrar o que era real do que era ruído.** Ele me trouxe 10 ideias de problemas mapeados. Eu desafiei cada uma. Ele me desafiou de volta — inclusive questionou se a solução que estávamos desenhando não seria "um prompt wrapper bonito", e sugeriu o conceito do Brief Vivo (link compartilhável) como resposta pra isso.

**O que validou a escolha:** o dado de que 80% dos clientes acham que escrevem bons briefs enquanto apenas 10% das agências concordam (Better Briefs Project) foi o momento em que a ficha caiu. O problema não é estruturar informação — é que **o gargalo está entre duas pessoas que não falam a mesma língua** (cliente e agência). Nenhuma ferramenta ataca esse momento. O BriefForge ataca.

Não fingi que tive insights de campo. Usei as ferramentas que tenho — IA como copiloto de pesquisa, pensamento crítico como filtro, e honestidade como diferencial.

A pergunta que guiou tudo foi: **e se a IA pudesse fazer o trabalho pesado de estruturar e auditar, e o cliente só precisasse completar o que falta, no formato mais simples possível?**

Daí nasceram as três decisões fundamentais do BriefForge:
1. **Input livre** — aceitar qualquer formato, porque forçar estrutura na entrada é pedir pro cliente fazer o trabalho do Account
2. **Auditoria automática** — não basta extrair, precisa identificar o que está faltando e o que se contradiz
3. **Brief Vivo** — em vez de mandar PDF e esperar resposta, dar um link onde o cliente preenche as lacunas e o Account vê em tempo real

O raciocínio completo — incluindo conversas com IA durante a exploração do problema, decisões que tomei e descartei, e o workflow de desenvolvimento — está documentado na pasta [`/process-log`](./process-log/).

---

## Quem usa e quando

### As duas personas

O BriefForge foi pensado para **duas personas com necessidades complementares**:

**O Account (usuário interno)**
Profissional de atendimento, gerente de projetos ou estrategista de agência. É quem faz a ponte entre cliente e time criativo. Usa o BriefForge no momento em que recebe informações do cliente e precisa transformar em um documento acionável.

**O Cliente (usuário externo)**
Pode ser o dono da empresa, o gerente de marketing ou qualquer stakeholder do lado do cliente. Não entende jargão de agência, não quer preencher formulários longos. Recebe um link e vê apenas o que falta, escrito em linguagem simples.

### O momento na rotina

```
Reunião com cliente          Briefing para o time
       │                              │
       ▼                              ▼
  [Anotações soltas]  ──→  BriefForge  ──→  [Brief estruturado]
  [Áudio transcrito]       em minutos       [Score de qualidade]
  [Thread de e-mail]                        [Lacunas identificadas]
       │                                          │
       ▼                                          ▼
  Cliente recebe                          Time criativo recebe
  link do Brief Vivo                      brief completo e auditado
  e completa lacunas                      com confiança pra executar
```

**Cenário típico:**
1. Segunda-feira, 10h — Account sai de uma call com o cliente. Tem anotações, um e-mail anterior e um áudio transcrito.
2. 10h05 — Cola tudo no BriefForge. Em 30 segundos, tem um brief estruturado com score 62/100. A auditoria aponta: orçamento não mencionado, prazo vago, público-alvo genérico.
3. 10h10 — Compartilha o Brief Vivo com o cliente via WhatsApp: "Fulano, montei o brief da campanha. Faltam 3 infos — pode completar aqui?"
4. 11h30 — Cliente preenche as lacunas. Score sobe pra 87/100. Account vê as atualizações em tempo real.
5. 11h35 — Account exporta o brief em PDF e envia pro time criativo.

**O que muda no processo de hoje:**
- **Antes:** 40min–2h para montar brief manualmente + 2-3 rodadas de e-mail pedindo infos que faltam + brief incompleto que gera retrabalho
- **Depois:** 5min para brief estruturado + 1 link pro cliente completar + brief auditado com score de qualidade

---

## O que torna o BriefForge diferente

### Brief Vivo — o diferencial principal

A maioria das ferramentas de brief gera um documento estático. O BriefForge gera um **documento vivo**: um link compartilhável onde o cliente colabora preenchendo exatamente o que falta, em tempo real. O Account acompanha as atualizações sem precisar trocar mais um e-mail.

### Auditoria inteligente, não apenas extração

O BriefForge não só extrai informações — ele **audita**. Identifica lacunas críticas ("orçamento não mencionado"), contradições ("diz premium mas pede o menor preço") e calcula um score ponderado por 4 dimensões: completude (40%), clareza (30%), coerência (20%) e mensurabilidade (10%).

### Sem autenticação, sem barreiras

Tudo funciona via ID anônimo persistido no navegador. O Account não precisa criar conta. O cliente não precisa baixar nada. Um link e pronto.

---

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Input Livre** | Textarea que aceita qualquer formato — transcrição, e-mail, WhatsApp, notas soltas |
| **Motor de IA** | Extração + auditoria + scoring via streaming (campos aparecem em tempo real) |
| **10 Campos Estratégicos** | Contexto, objetivo SMART, público-alvo, mensagem principal, tom de voz, entregáveis, orçamento, prazo, KPIs, referências |
| **Score de Qualidade** | 0-100, ponderado por completude, clareza, coerência e mensurabilidade |
| **Auditoria com Severidade** | Gaps classificados como critical/warning, contradições identificadas, sugestões por campo |
| **Editor Inline** | Cada campo é editável diretamente, com re-auditoria automática |
| **Brief Vivo** | Link compartilhável para o cliente completar lacunas — atualização em tempo real |
| **Exportação** | PDF estilizado e Markdown (copiar para clipboard) |
| **Histórico** | Briefs salvos automaticamente, reacessíveis com score e status |
| **Dark/Light Mode** | Interface editorial refinada com dois temas |

---

## Stack técnica

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, API Routes, SSR, deploy zero-config na Vercel |
| **UI** | Tailwind CSS 4 + shadcn/ui | Design system consistente, componentes acessíveis |
| **Linguagem** | TypeScript | Type safety em toda a aplicação |
| **IA** | Vercel AI SDK + OpenRouter (Claude) | `streamObject` com schema Zod para parsing progressivo campo a campo |
| **Validação** | Zod | Schema tipado para output da IA e validação de inputs |
| **Banco de dados** | Supabase (PostgreSQL) | Persistência, queries, Realtime subscriptions |
| **Real-time** | Supabase Realtime | Updates instantâneos no Brief Vivo (fallback: polling 5s) |
| **PDF** | @react-pdf/renderer | Geração client-side com layout em React |
| **Animações** | Framer Motion | Streaming reveal, score counter, transições suaves |
| **Testes** | Vitest + Testing Library | 44 arquivos de teste cobrindo componentes, hooks, API routes e utils |
| **Deploy** | Vercel | CI/CD automático a partir do repositório |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│  Next.js 16 App Router · React 19 · Tailwind CSS 4     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │  Home    │  │  Brief   │  │  Brief    │             │
│  │  Input   │→ │  View    │→ │  Vivo     │             │
│  │  Livre   │  │  + Audit │  │  (share)  │             │
│  └──────────┘  └──────────┘  └───────────┘             │
│       │              ↕              ↕                    │
├───────┼──────────────┼──────────────┼───────────────────┤
│       │         API Routes          │                    │
│  POST /generate   GET|PATCH /brief/[id]   POST /audit  │
│       │              │              │                    │
├───────┼──────────────┼──────────────┼───────────────────┤
│       ↓              ↓              ↓                    │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐          │
│  │ OpenRouter│  │   Supabase   │  │ Supabase │          │
│  │ (Claude) │  │  PostgreSQL  │  │ Realtime │          │
│  │ streamObj│  │   + RLS      │  │          │          │
│  └──────────┘  └──────────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Fluxo principal:**
1. Account cola texto caótico na home
2. `POST /api/generate` envia para OpenRouter (Claude) via `streamObject`
3. IA retorna brief estruturado + auditoria + score em streaming
4. Brief salvo no Supabase, exibido em split-view (brief + auditoria)
5. Account edita campos inline → `POST /api/audit` re-audita
6. Account compartilha link → cliente preenche lacunas via Brief Vivo
7. Supabase Realtime sincroniza updates em tempo real

---

## Como rodar localmente

### Pré-requisitos

- [Bun](https://bun.sh) (runtime e package manager)
- Conta no [Supabase](https://supabase.com) (free tier)
- API key do [OpenRouter](https://openrouter.ai)

### Setup

```bash
# Clone o repositório
git clone https://github.com/victoralmeida/briefforge.git
cd briefforge

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves:
# OPENROUTER_API_KEY=sk-or-...
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Rode o servidor de desenvolvimento
bun dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Comandos úteis

```bash
bun dev              # Servidor de desenvolvimento
bun run build        # Build de produção
bun run lint         # Linter
bun run test         # Rodar todos os testes
bun run test:watch   # Testes em modo watch
bun run test:coverage # Testes com cobertura
```

---

## Estrutura do projeto

```
briefforge/
├── app/
│   ├── page.tsx                    # Home — input livre + briefs recentes
│   ├── brief/[id]/page.tsx         # Brief view/edit (account)
│   ├── share/[id]/page.tsx         # Brief Vivo (cliente)
│   ├── history/page.tsx            # Histórico de briefs
│   ├── sobre/page.tsx              # Sobre o projeto
│   └── api/
│       ├── generate/route.ts       # Geração de brief via IA (streaming)
│       ├── audit/route.ts          # Re-auditoria de brief editado
│       └── brief/[id]/route.ts     # CRUD do brief
├── components/                     # 15 componentes React
│   ├── ui/                         # Componentes base (shadcn/ui)
│   ├── brief-input.tsx             # Textarea de input livre
│   ├── brief-view.tsx              # Split-view do brief
│   ├── audit-panel.tsx             # Painel de auditoria
│   ├── brief-client-view.tsx       # View do cliente (Brief Vivo)
│   ├── score-display.tsx           # Score circular animado
│   └── ...                         # share-button, export-menu, etc.
├── lib/
│   ├── ai/                         # OpenRouter config, prompts, schema Zod
│   ├── supabase/                   # Clients (browser + server) + helpers
│   ├── scoring.ts                  # Cálculo do score (4 dimensões)
│   ├── pdf.ts                      # Geração de PDF
│   └── markdown.ts                 # Geração de Markdown
├── hooks/
│   ├── use-anonymous-id.ts         # ID anônimo persistido no localStorage
│   ├── use-brief-stream.ts         # Hook de streaming (useObject)
│   └── use-brief-realtime.ts       # Hook de Realtime (Supabase)
├── __tests__/                      # 44 arquivos de teste
└── specs/                          # 12 especificações detalhadas (TDD)
```

---

## Metodologia

### TDD rigoroso

Cada feature foi desenvolvida seguindo o ciclo Red-Green-Refactor:

1. **RED** — Testes escritos antes do código, baseados nas specs detalhadas
2. **GREEN** — Implementação mínima para os testes passarem
3. **REFACTOR** — Melhoria do código com testes como rede de segurança

O projeto conta com **44 arquivos de teste** cobrindo componentes, hooks, API routes, utilitários e integrações.

### Specs como fonte de verdade

Cada feature tem uma spec detalhada em `/specs/` com: requisitos, contratos de API, schema de dados, testes TDD e critérios de aceite. As specs guiaram toda a implementação.

### AI-assisted development

O projeto foi desenvolvido inteiramente com **Claude Code** (CLI do Claude da Anthropic), usando o modelo Claude como par de programação. Toda a arquitetura, implementação, testes e este README foram criados nesse fluxo colaborativo humano-IA.

### Process Log — o "making of"

A pasta [`/process-log`](./process-log/) documenta o processo completo de desenvolvimento — não é documentação técnica, é o raciocínio por trás do produto.

#### 1. Descobrindo a dor

Como cheguei no problema de briefings em agências, usando IA como ferramenta de pesquisa estratégica:

| Documento | O que contém |
|-----------|-------------|
| [Conversa com Claude](./process-log/1_descobrindo_a_dor/claude/1_conversa_claude.md) | Pesquisa de fricções, 10 ideias ranqueadas, análise crítica do Gemini, refinamento do escopo, definição de stack e decisão final pelo BriefForge |
| [Pesquisa Gemini Deep Research](./process-log/1_descobrindo_a_dor/gemini/2_doc_robusto_gemini.md) | Documento extenso cruzando tendências MarTech, dados do Better Briefs Project, cenário macro de agências e proposta de solução |

#### 2. Meu workflow com Claude Code

Como uso o Claude Code no dia a dia de desenvolvimento — specs, tasks, subagentes paralelos e TDD:

| Documento | O que contém |
|-----------|-------------|
| [Contexto](./process-log/2_meu_workflow/0_explicacoes.md) | Explicação sobre o workflow e por que uso conversas de outro projeto como exemplo |
| [Conversa inicial](./process-log/2_meu_workflow/1_conversa_inicial.md) | Refinamento do `CLAUDE.md` com base no PRD — o que manter, o que cortar, decisões de custo e Supabase |
| [Criação das specs](./process-log/2_meu_workflow/2_criacao_specs.md) | Como pedi ao Claude para gerar 12 specs com TDD rigoroso, e as regras que defini para nunca burlar testes |
| [Criação das tasks](./process-log/2_meu_workflow/3_criacao_tasks.md) | Uso de 8 subagentes em paralelo para analisar cada spec e gerar ~80 tasks ordenadas por dependência |
| [Executando uma fase](./process-log/2_meu_workflow/4_executando_task.md) | Exemplo completo de execução: 3 ondas de subagentes paralelos, 18 tasks, 9 testes TDD, validação final |

#### 3. Documentos-chave do projeto

Arquivos que estruturam e guiam todo o desenvolvimento:

| Documento | O que contém |
|-----------|-------------|
| [PRD.md](./PRD.md) | Product Requirements Document — escopo completo, arquitetura, schema do banco, prompts de IA, decisões de produto |
| [Specs](./specs/) | 12 especificações detalhadas, uma por feature, cada uma com requisitos, contratos de API, schema e testes TDD |
| [TASKS.md](./TASKS.md) | Todas as tarefas organizadas por spec com status (`[ ]` pendente, `[~]` em progresso, `[x]` concluída) |
| [VALIDACAO.md](./VALIDACAO.md) | Checklist end-to-end para testar manualmente todas as funcionalidades — 12 fases cobrindo desde a home até edge cases |

---

## Decisões de design

### Por que sem autenticação?

O objetivo é **zero fricção**. Um Account de agência precisa gerar um brief rápido entre reuniões — criar conta é atrito desnecessário. O ID anônimo via localStorage resolve o caso de uso sem comprometer a experiência.

### Por que streaming campo a campo?

Esperar 10-15 segundos por uma resposta completa da IA é frustrante. Com `streamObject`, os campos aparecem progressivamente na tela, dando feedback visual imediato e reduzindo a percepção de espera.

### Por que Brief Vivo em vez de PDF?

PDFs são estáticos. O cliente recebe, imprime, anota à mão, manda foto. O Brief Vivo é um link onde o cliente preenche diretamente o que falta, com o brief atualizando em tempo real para o Account. Elimina uma rodada inteira de ida e volta.

### Por que dark mode como padrão?

O público-alvo são criativos de agência que passam o dia em ferramentas como Figma, VS Code e Notion — todas com dark mode como opção principal. A interface editorial escura com tipografia serif transmite sofisticação e reduz fadiga visual.

---

## Autor

**Victor Almeida**
[Linkedin](https://www.linkedin.com/in/victoralmeidadeveloper)
[Instagram](https://www.instagram.com/poucocodigo)

---

<p align="center">
  <strong>BriefForge</strong> — De caos para estratégia.
</p>
