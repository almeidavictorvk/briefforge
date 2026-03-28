# TASKS.md — BriefForge

> **Regras de status:**
> - `[ ]` — Tarefa pendente (não iniciada)
> - `[~]` — Tarefa em progresso (agente trabalhando nela agora)
> - `[x]` — Tarefa concluída
>
> **NUNCA burle essas regras.** Ao iniciar uma tarefa, marque `[~]` imediatamente. Ao concluir, marque `[x]`. Nunca deixe `[~]` se não estiver ativamente trabalhando.
>
> **Descobertas durante o desenvolvimento:**
> - Se durante o desenvolvimento algo for descoberto que precisa ser corrigido ou desenvolvido, **primeiro verifique se já não existe como task no TASKS.md**. Se não existir, adicione como nova task na seção apropriada. **Não desenvolva a nova task** — prossiga com a tarefa atual.
> - Se uma descoberta relevante for feita (workaround, comportamento inesperado, decisão técnica), **registre na seção "Aprendizados" do CLAUDE.md**.

---

## 1. Setup & Foundation — [specs/setup_foundation.md](specs/setup_foundation.md)

- [x] Configurar Next.js 16 com App Router e TypeScript strict
- [x] Instalar e configurar Tailwind CSS 4 com design tokens e dark mode
- [x] Inicializar e configurar shadcn/ui com tema customizado
- [x] Instalar e configurar Vitest com testing-library/react e jest-dom
- [x] Criar arquivo vitest.config.ts com path aliases do TypeScript
- [x] Criar arquivo vitest.setup.ts com setup global de testes
- [x] Adicionar scripts de teste no package.json (test, test:watch, test:coverage)
- [x] Criar estrutura de pastas (app, components/ui, lib/supabase, lib/ai, lib/i18n, hooks, styles, __tests__, specs)
- [x] Importar fontes Google (Instrument Serif, Plus Jakarta Sans, IBM Plex Mono) via next/font
- [x] Criar root layout (app/layout.tsx) com providers, fontes e dark mode
- [x] Criar página home placeholder (app/page.tsx)
- [x] Configurar CSS variables e Tailwind no styles/globals.css
- [x] **TDD:** Teste de configuração Vitest funciona
- [x] **TDD:** Teste de path aliases funcionando
- [x] **TDD:** Teste de root layout renderiza children
- [x] **TDD:** Teste de root layout aplica fonte body
- [x] **TDD:** Teste de root layout aplica dark mode por padrão
- [x] **TDD:** Teste de home page renderiza sem erros
- [x] Validar que `bun run dev`, `bun run build`, `bun run test` e `bun run lint` executam sem erros

## 2. Schema & Types — [specs/schema_types.md](specs/schema_types.md)

- [x] Criar fieldSchema Zod com validação de content, status e suggestion
- [x] Criar briefSchema Zod com validação dos 10 campos do brief
- [x] Adicionar validação de audit no briefSchema (gaps e contradictions)
- [x] Adicionar validação de score (0-100) no briefSchema
- [x] Validar severidade de gaps (critical|warning)
- [x] Criar interfaces TypeScript (BriefField, BriefFields, AuditGap, AuditContradiction, AuditResults, Brief)
- [x] Criar tipos BriefStatus, FieldName, FieldStatus
- [x] Exportar constante FIELD_NAMES com array dos 10 campos
- [x] Exportar objeto com labels dos campos em PT-BR e EN
- [x] **TDD:** fieldSchema valida campo completo
- [x] **TDD:** fieldSchema valida campo com suggestion
- [x] **TDD:** fieldSchema rejeita status inválido
- [x] **TDD:** fieldSchema rejeita sem content
- [x] **TDD:** briefSchema valida brief completo
- [x] **TDD:** briefSchema rejeita score fora do range (>100)
- [x] **TDD:** briefSchema rejeita score negativo
- [x] **TDD:** briefSchema rejeita campo faltando
- [x] **TDD:** briefSchema valida audit com gaps
- [x] **TDD:** briefSchema valida audit com contradictions
- [x] **TDD:** briefSchema rejeita severity inválida
- [x] **TDD:** FIELD_NAMES contém exatamente 10 campos
- [x] **TDD:** FIELD_NAMES contém todos os campos esperados
- [x] **TDD:** z.infer<typeof briefSchema> é compatível com Brief type

## 3. Database (Supabase) — [specs/database.md](specs/database.md)

- [x] Criar migration SQL para tabela briefs (supabase/migrations/001_create_briefs.sql)
- [x] Definir tipo BriefRow em lib/types.ts
- [x] Implementar client Supabase browser em lib/supabase/client.ts
- [x] Implementar server client Supabase em lib/supabase/server.ts
- [x] Criar helper parseBriefRow para conversão BriefRow → Brief
- [x] Configurar RLS policies (owner CRUD + shared briefs públicos)
- [x] Criar indexes (idx_briefs_anonymous_id, idx_briefs_share_enabled)
- [x] Habilitar Realtime na tabela briefs
- [x] **TDD:** createClient retorna instância do Supabase
- [x] **TDD:** createClient usa variáveis de ambiente corretas
- [x] **TDD:** createServerClient retorna instância do Supabase
- [x] **TDD:** createServerClient usa service role key
- [x] **TDD:** parseBriefRow converte JSONB fields corretamente
- [x] **TDD:** parseBriefRow mantém metadata (id, anonymous_id, created_at, status)
- [x] **TDD:** parseBriefRow trata campos JSONB vazios com defaults
- [x] **TDD:** Migration SQL é válida e contém CREATE TABLE briefs
- [x] **TDD:** Migration inclui todos os campos obrigatórios

## 4. Design System — [specs/design_system.md](specs/design_system.md)

- [x] Definir variáveis CSS para tokens de design (dark e light mode)
- [x] Implementar script inline no head para evitar flash de tema incorreto
- [x] Configurar dark mode como padrão com persistência em localStorage
- [x] Criar componente ThemeToggle com ícones sol/lua
- [x] Implementar persistência de tema no localStorage
- [x] Atualizar layout.tsx com theme provider
- [x] Criar componente Header com logo "BriefForge" em Instrument Serif
- [x] Adicionar link "Histórico" no Header apontando para /history
- [x] Integrar ThemeToggle no Header
- [x] Adicionar placeholder para language toggle no Header
- [x] Tornar Header fixo no topo e responsivo (mobile)
- [x] Aplicar padrões globais de tipografia (Instrument Serif, Plus Jakarta Sans, IBM Plex Mono)
- [x] Aplicar padrões de componentes (cards, botões, glass morphism, sombras, transições)
- [x] **TDD:** ThemeToggle renderiza
- [x] **TDD:** ThemeToggle alterna de dark para light
- [x] **TDD:** ThemeToggle alterna de light para dark
- [x] **TDD:** ThemeToggle persiste no localStorage
- [x] **TDD:** ThemeToggle inicializa do localStorage
- [x] **TDD:** Header renderiza logo "BriefForge" (RED → GREEN)
- [x] **TDD:** Header contém link para histórico (RED → GREEN)
- [x] **TDD:** Header contém ThemeToggle (RED → GREEN)
- [x] **TDD:** Header é responsivo (RED → GREEN)
- [x] **TDD:** Design tokens dark estão definidos (RED → GREEN)
- [x] **TDD:** Design tokens light estão definidos (RED → GREEN)
- [x] **TDD:** Accent color é consistente entre temas (RED → GREEN)

## 5. AI Engine (Motor de IA) — [specs/ai_engine.md](specs/ai_engine.md)

- [x] Configurar OpenRouter como provider com API key do ambiente
- [x] Criar prompt de sistema para geração de brief (extração + auditoria + scoring)
- [x] Criar prompt de sistema para re-auditoria de brief editado
- [x] Implementar API route POST /api/generate com validação de entrada
- [x] Implementar streaming via streamObject do Vercel AI SDK
- [x] Implementar retorno como result.toTextStreamResponse()
- [x] Implementar validação de rawInput não vazio e language válida
- [x] Implementar tratamento de erros (400 input vazio, 400 language inválida, 500 falha IA)
- [x] Criar hook useBriefStream com useObject do @ai-sdk/react
- [x] Implementar método generate(data) que envia rawInput e language para API
- [x] **TDD:** OpenRouter provider é criado com API key (RED → GREEN)
- [x] **TDD:** OpenRouter provider expõe modelo (RED → GREEN)
- [x] **TDD:** generateSystemPrompt retorna string não vazia
- [x] **TDD:** generateSystemPrompt inclui idioma
- [x] **TDD:** generateSystemPrompt inclui os 10 campos
- [x] **TDD:** generateSystemPrompt inclui regras de scoring
- [x] **TDD:** generateSystemPrompt inclui regra de não inventar
- [x] **TDD:** auditSystemPrompt retorna string não vazia
- [x] **TDD:** auditSystemPrompt instrui re-avaliação
- [x] **TDD:** POST /api/generate retorna stream com input válido
- [x] **TDD:** POST /api/generate rejeita input vazio
- [x] **TDD:** POST /api/generate rejeita sem rawInput
- [x] **TDD:** POST /api/generate rejeita language inválida
- [x] **TDD:** POST /api/generate trata erro da IA gracefully
- [x] **TDD:** useBriefStream retorna interface correta
- [x] **TDD:** useBriefStream.brief inicia como undefined
- [x] **TDD:** useBriefStream.isLoading inicia como false

## 6. Scoring — [specs/scoring.md](specs/scoring.md)

- [x] Implementar calculateCompleteness (campos complete/partial/missing)
- [x] Implementar calculateClarity (heurística baseada em tamanho e especificidade)
- [x] Implementar calculateCoherence (proporção inversa de contradições)
- [x] Implementar calculateMeasurability (status do campo KPIs)
- [x] Implementar calculateScore aplicando pesos (40%, 30%, 20%, 10%)
- [x] Implementar getScoreColor retornando success/warning/error por faixa
- [x] Implementar getScoreLabel retornando label textual por faixa
- [x] Criar componente ScoreDisplay com score numérico e indicador visual
- [x] Adicionar animação de contagem (Framer Motion) ao ScoreDisplay
- [x] Configurar fonte IBM Plex Mono no ScoreDisplay
- [x] **TDD:** calculateCompleteness retorna 100 com todos campos complete
- [x] **TDD:** calculateCompleteness retorna 0 com todos campos missing
- [x] **TDD:** calculateCompleteness retorna 50 com todos campos partial
- [x] **TDD:** calculateCompleteness calcula mix corretamente
- [x] **TDD:** calculateClarity retorna score alto para conteúdo longo e específico
- [x] **TDD:** calculateClarity retorna score baixo para conteúdo vago/curto
- [x] **TDD:** calculateCoherence retorna 100 sem contradições
- [x] **TDD:** calculateCoherence reduz score proporcionalmente por contradição
- [x] **TDD:** calculateMeasurability retorna 100 quando KPIs complete
- [x] **TDD:** calculateMeasurability retorna 0 quando KPIs missing
- [x] **TDD:** calculateScore aplica pesos corretamente
- [x] **TDD:** calculateScore retorna 0 para brief vazio
- [x] **TDD:** calculateScore retorna 100 para brief perfeito
- [x] **TDD:** calculateScore nunca retorna valor fora de 0-100
- [x] **TDD:** getScoreColor retorna 'success' para score >= 70
- [x] **TDD:** getScoreColor retorna 'warning' para score 40-69
- [x] **TDD:** getScoreColor retorna 'error' para score < 40
- [x] **TDD:** getScoreLabel retorna labels corretas por faixa
- [x] **TDD:** ScoreDisplay renderiza o score numérico
- [x] **TDD:** ScoreDisplay aplica cor correta baseada no score
- [x] **TDD:** ScoreDisplay exibe label textual
- [x] **TDD:** ScoreDisplay usa fonte mono IBM Plex Mono

## 7. Input Livre (F1) — [specs/input_livre.md](specs/input_livre.md)

- [x] Implementar hook useAnonymousId para gerar e persistir UUID no localStorage
- [x] Criar componente BriefInput com textarea, placeholder contextual e contador de caracteres
- [x] Implementar botão "Forjar Brief" com estados (disabled, loading) e validação mínima de 10 chars
- [x] Integrar BriefInput com fluxo de submissão para /api/generate
- [x] Criar componente BriefCard para exibição de briefs recentes (título, score, data, status)
- [x] Implementar listagem dos últimos 5 briefs do anonymous_id via Supabase
- [x] Integrar página Home com Hero Section (heading Instrument Serif + subtitle)
- [x] Conectar fluxo completo: POST /api/generate → salvar Supabase → redirect /brief/[id]
- [x] Adicionar funcionalidade "Colar" (clipboard) no BriefInput
- [x] Implementar estado vazio elegante quando não há briefs recentes
- [x] **TDD:** useAnonymousId gera ID no primeiro uso
- [x] **TDD:** useAnonymousId persiste no localStorage
- [x] **TDD:** useAnonymousId reutiliza ID existente
- [x] **TDD:** useAnonymousId retorna isReady=true quando ID disponível
- [x] **TDD:** BriefInput renderiza textarea
- [x] **TDD:** BriefInput exibe placeholder
- [x] **TDD:** BriefInput atualiza valor ao digitar
- [x] **TDD:** BriefInput mostra contador de caracteres
- [x] **TDD:** BriefInput chama onSubmit com o texto
- [x] **TDD:** BriefInput desabilita submit com menos de 10 chars
- [x] **TDD:** BriefInput habilita submit com 10+ chars
- [x] **TDD:** BriefInput mostra loading state
- [x] **TDD:** BriefCard renderiza título
- [x] **TDD:** BriefCard renderiza score com cor correta
- [x] **TDD:** BriefCard renderiza data relativa
- [x] **TDD:** BriefCard renderiza status badge
- [x] **TDD:** BriefCard é clicável e navega
- [x] **TDD:** Home renderiza heading principal
- [x] **TDD:** Home renderiza BriefInput
- [x] **TDD:** Home renderiza seção de recentes
- [x] **TDD:** Home exibe estado vazio quando não há briefs

## 8. Brief View (F3) — [specs/brief_view.md](specs/brief_view.md)

- [x] Criar API route GET /api/brief/[id] para carregar brief do Supabase
- [x] Criar componente FieldStatusBadge com variantes complete/partial/missing
- [x] Criar componente BriefField para exibir campo individual com status
- [x] Criar componente AuditPanel para exibir lacunas, contradições e nota geral
- [x] Criar componente BriefView para layout split-view (brief + auditoria)
- [x] Criar página /brief/[id] que carrega e exibe o brief
- [x] Implementar integração de streaming via useBriefStream
- [x] Implementar animações fade-in staggered nos campos do brief
- [x] Implementar counter animation para score display
- [x] **TDD:** GET /api/brief/[id] retorna brief existente
- [x] **TDD:** GET /api/brief/[id] retorna 404 para brief inexistente
- [x] **TDD:** GET /api/brief/[id] retorna 400 para ID inválido
- [x] **TDD:** BriefField renderiza label e conteúdo
- [x] **TDD:** BriefField renderiza status badge
- [x] **TDD:** BriefField renderiza suggestion quando partial
- [x] **TDD:** BriefField não renderiza suggestion quando complete
- [x] **TDD:** BriefField renderiza estado missing
- [x] **TDD:** FieldStatusBadge renderiza variante complete
- [x] **TDD:** FieldStatusBadge renderiza variante partial
- [x] **TDD:** FieldStatusBadge renderiza variante missing
- [x] **TDD:** AuditPanel renderiza gaps
- [x] **TDD:** AuditPanel renderiza gaps com severity correta
- [x] **TDD:** AuditPanel renderiza contradictions
- [x] **TDD:** AuditPanel renderiza nota geral
- [x] **TDD:** AuditPanel renderiza estado vazio
- [x] **TDD:** BriefView renderiza todos os 10 campos
- [x] **TDD:** BriefView renderiza split-view
- [x] **TDD:** BriefView renderiza ScoreDisplay
- [x] **TDD:** BriefView renderiza título do brief
- [x] **TDD:** Página /brief/[id] carrega brief
- [x] **TDD:** Página /brief/[id] mostra loading
- [x] **TDD:** Página /brief/[id] mostra erro se brief não encontrado

## 9. Editor Inline (F4) — [specs/editor_inline.md](specs/editor_inline.md)

- [x] Implementar modo edição no BriefField com textarea expansível
- [x] Adicionar botões "Salvar" e "Cancelar" ao modo edição
- [x] Criar endpoint PATCH /api/brief/[id] para atualizar campo individual
- [x] Implementar validação de campo válido e anonymous_id no PATCH
- [x] Criar endpoint POST /api/audit para re-auditoria com streamObject
- [x] Implementar recálculo de score no POST /api/audit
- [x] Adicionar botão "Re-auditar" ao header da brief view
- [x] Implementar animação de score com recontagem na re-auditoria
- [x] Implementar feedback visual de sucesso ao salvar (checkmark, borda)
- [x] Implementar auto-resize de textarea baseado no conteúdo
- [x] Implementar preenchimento de campos missing com textarea vazia
- [x] Implementar atualização de badge de status após edição
- [x] **TDD:** BriefField entra em modo edição ao clicar editar
- [x] **TDD:** BriefField exibe conteúdo atual na textarea ao editar
- [x] **TDD:** BriefField permite editar e atualizar valor
- [x] **TDD:** BriefField salva ao clicar "Salvar" e invoca callback
- [x] **TDD:** BriefField cancela e restaura conteúdo original
- [x] **TDD:** BriefField mostra indicador de loading durante save
- [x] **TDD:** BriefField campo missing exibe textarea vazia com placeholder
- [x] **TDD:** POST /api/audit retorna stream com status 200
- [x] **TDD:** POST /api/audit rejeita sem briefId (400)
- [x] **TDD:** POST /api/audit rejeita sem structured_brief (400)
- [x] **TDD:** POST /api/audit trata erro da IA (500)
- [x] **TDD:** PATCH /api/brief/[id] atualiza campo individual
- [x] **TDD:** PATCH /api/brief/[id] rejeita campo inválido (400)
- [x] **TDD:** PATCH /api/brief/[id] rejeita anonymous_id incorreto (403)
- [x] **TDD:** PATCH /api/brief/[id] retorna brief atualizado
- [x] **TDD:** PATCH /api/brief/[id] atualiza timestamp updated_at

## 10. Brief Vivo (F5) — [specs/brief_vivo.md](specs/brief_vivo.md)

- [x] Implementar componente ShareButton com geração e cópia de link
- [x] Configurar rota pública /share/[id] para visualização do cliente
- [x] Implementar componente BriefClientView com filtragem de campos pendentes
- [x] Criar componente ClientField com linguagem simplificada e placeholders guiados
- [x] Implementar endpoint PATCH /api/brief/[id] para atualizar client_inputs
- [x] Configurar hook useBriefRealtime para subscription em mudanças do brief
- [x] Implementar componente RealtimeIndicator com status do cliente
- [x] Adicionar lógica de atualização automática de campos e score ao receber client_inputs
- [x] **TDD:** ShareButton renderiza botão de compartilhar
- [x] **TDD:** ShareButton gera link correto
- [x] **TDD:** ShareButton copia link para clipboard
- [x] **TDD:** ShareButton mostra feedback de "copiado"
- [x] **TDD:** ShareButton desabilita se brief não salvo
- [x] **TDD:** ClientField renderiza label simplificada
- [x] **TDD:** ClientField renderiza placeholder guiado
- [x] **TDD:** ClientField permite digitação
- [x] **TDD:** ClientField exibe conteúdo existente (readonly) para campos complete
- [x] **TDD:** ClientField chama onSave ao submeter
- [x] **TDD:** ClientField mostra loading durante save
- [x] **TDD:** BriefClientView renderiza apenas campos missing/partial
- [x] **TDD:** BriefClientView não renderiza campos complete
- [x] **TDD:** BriefClientView renderiza mensagem de boas-vindas
- [x] **TDD:** BriefClientView renderiza progresso do preenchimento
- [x] **TDD:** BriefClientView renderiza estado "tudo preenchido"
- [x] **TDD:** RealtimeIndicator mostra "cliente online"
- [x] **TDD:** RealtimeIndicator mostra "cliente offline"
- [x] **TDD:** RealtimeIndicator mostra contagem campos preenchidos
- [x] **TDD:** useBriefRealtime retorna brief atualizado
- [x] **TDD:** useBriefRealtime reconecta após desconexão
- [x] **TDD:** useBriefRealtime chama callback ao receber update
- [x] **TDD:** Página /share/[id] carrega brief público
- [x] **TDD:** Página /share/[id] mostra erro se brief não compartilhado
- [x] **TDD:** Página /share/[id] renderiza BriefClientView
- [x] **TDD:** Página /share/[id] salva client_inputs ao preencher

## 11. Exportações (F6) — [specs/exportacoes.md](specs/exportacoes.md)

- [x] Implementar componente ExportMenu com dropdown (PDF e Markdown)
- [x] Criar função generateBriefPDF em lib/pdf.ts com @react-pdf/renderer
- [x] Criar função generateBriefMarkdown em lib/markdown.ts
- [x] Implementar copy to clipboard com fallback
- [x] Integrar ExportMenu no header da brief view
- [x] Adicionar seções no PDF (header, score, campos, pendências, checklist, footer)
- [x] Estilizar PDF com fontes e cores dos design tokens
- [x] Incluir seção de auditoria no Markdown
- [x] Implementar feedback visual (toast) ao copiar Markdown
- [x] **TDD:** generateBriefMarkdown retorna string não vazia
- [x] **TDD:** generateBriefMarkdown inclui título
- [x] **TDD:** generateBriefMarkdown inclui score
- [x] **TDD:** generateBriefMarkdown inclui todos os 10 campos
- [x] **TDD:** generateBriefMarkdown inclui status dos campos
- [x] **TDD:** generateBriefMarkdown inclui suggestions
- [x] **TDD:** generateBriefMarkdown inclui seção de auditoria
- [x] **TDD:** generateBriefMarkdown inclui nota geral
- [x] **TDD:** generateBriefMarkdown inclui footer
- [x] **TDD:** generateBriefPDF retorna Blob
- [x] **TDD:** generateBriefPDF inclui título no documento
- [x] **TDD:** generateBriefPDF inclui todos os 10 campos
- [x] **TDD:** ExportMenu renderiza botão de exportar
- [x] **TDD:** ExportMenu abre dropdown com opções
- [x] **TDD:** ExportMenu chama geração de PDF ao selecionar
- [x] **TDD:** ExportMenu chama geração de Markdown ao selecionar
- [x] **TDD:** ExportMenu copia markdown para clipboard

## 12. Histórico (F7) — [specs/historico.md](specs/historico.md)

- [x] Criar página /history com header "Seus Briefs" e contagem total
- [x] Implementar carregamento de briefs por anonymous_id (ordenados por updated_at DESC, limit 50)
- [x] Implementar estado vazio com mensagem e botão "Criar primeiro brief"
- [x] Implementar loading state na página
- [x] Expandir BriefCard com barra de score visual com cor
- [x] Adicionar status badge ao BriefCard (Rascunho, Compartilhado, Completo)
- [x] Implementar progresso do cliente no BriefCard ("Cliente: X/Y preenchidos")
- [x] Implementar data relativa formatada ("2h atrás", "ontem")
- [x] Adicionar hover effects (scale, shadow) ao BriefCard
- [x] Implementar navegação ao clicar no BriefCard para /brief/[id]
- [x] Implementar auto-save de briefs após geração e edição
- [x] Implementar input de busca para filtrar briefs por título (client-side)
- [x] **TDD:** History page renderiza título "Seus Briefs"
- [x] **TDD:** History page lista briefs do usuário
- [x] **TDD:** History page ordena por updated_at DESC
- [x] **TDD:** History page mostra contagem total
- [x] **TDD:** History page mostra estado vazio
- [x] **TDD:** History page mostra loading state
- [x] **TDD:** History page filtra por busca
- [x] **TDD:** BriefCard renderiza score bar
- [x] **TDD:** BriefCard renderiza status "Rascunho"
- [x] **TDD:** BriefCard renderiza status "Compartilhado"
- [x] **TDD:** BriefCard renderiza status "Completo"
- [x] **TDD:** BriefCard mostra progresso do cliente
- [x] **TDD:** BriefCard renderiza data relativa
- [x] **TDD:** BriefCard navega ao clicar

## ~~13. Bilíngue (F8)~~ — REMOVIDO

> Decisão: módulo bilíngue removido do escopo. Interface será apenas PT-BR. A IA já aceita o parâmetro `language` nas API routes, então suporte a EN pode ser adicionado no futuro sem retrabalho no backend.
