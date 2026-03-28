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
- [ ] Instalar e configurar Tailwind CSS 4 com design tokens e dark mode
- [ ] Inicializar e configurar shadcn/ui com tema customizado
- [x] Instalar e configurar Vitest com testing-library/react e jest-dom
- [x] Criar arquivo vitest.config.ts com path aliases do TypeScript
- [x] Criar arquivo vitest.setup.ts com setup global de testes
- [x] Adicionar scripts de teste no package.json (test, test:watch, test:coverage)
- [x] Criar estrutura de pastas (app, components/ui, lib/supabase, lib/ai, lib/i18n, hooks, styles, __tests__, specs)
- [ ] Importar fontes Google (Instrument Serif, Plus Jakarta Sans, IBM Plex Mono) via next/font
- [ ] Criar root layout (app/layout.tsx) com providers, fontes e dark mode
- [ ] Criar página home placeholder (app/page.tsx)
- [ ] Configurar CSS variables e Tailwind no styles/globals.css
- [ ] **TDD:** Teste de configuração Vitest funciona
- [ ] **TDD:** Teste de path aliases funcionando
- [ ] **TDD:** Teste de root layout renderiza children
- [ ] **TDD:** Teste de root layout aplica fonte body
- [ ] **TDD:** Teste de root layout aplica dark mode por padrão
- [ ] **TDD:** Teste de home page renderiza sem erros
- [ ] Validar que `bun run dev`, `bun run build`, `bun run test` e `bun run lint` executam sem erros

## 2. Schema & Types — [specs/schema_types.md](specs/schema_types.md)

- [ ] Criar fieldSchema Zod com validação de content, status e suggestion
- [ ] Criar briefSchema Zod com validação dos 10 campos do brief
- [ ] Adicionar validação de audit no briefSchema (gaps e contradictions)
- [ ] Adicionar validação de score (0-100) no briefSchema
- [ ] Validar severidade de gaps (critical|warning)
- [ ] Criar interfaces TypeScript (BriefField, BriefFields, AuditGap, AuditContradiction, AuditResults, Brief)
- [ ] Criar tipos BriefStatus, FieldName, FieldStatus
- [ ] Exportar constante FIELD_NAMES com array dos 10 campos
- [ ] Exportar objeto com labels dos campos em PT-BR e EN
- [ ] **TDD:** fieldSchema valida campo completo
- [ ] **TDD:** fieldSchema valida campo com suggestion
- [ ] **TDD:** fieldSchema rejeita status inválido
- [ ] **TDD:** fieldSchema rejeita sem content
- [ ] **TDD:** briefSchema valida brief completo
- [ ] **TDD:** briefSchema rejeita score fora do range (>100)
- [ ] **TDD:** briefSchema rejeita score negativo
- [ ] **TDD:** briefSchema rejeita campo faltando
- [ ] **TDD:** briefSchema valida audit com gaps
- [ ] **TDD:** briefSchema valida audit com contradictions
- [ ] **TDD:** briefSchema rejeita severity inválida
- [ ] **TDD:** FIELD_NAMES contém exatamente 10 campos
- [ ] **TDD:** FIELD_NAMES contém todos os campos esperados
- [ ] **TDD:** z.infer<typeof briefSchema> é compatível com Brief type

## 3. Database (Supabase) — [specs/database.md](specs/database.md)

- [ ] Criar migration SQL para tabela briefs (supabase/migrations/001_create_briefs.sql)
- [ ] Definir tipo BriefRow em lib/types.ts
- [ ] Implementar client Supabase browser em lib/supabase/client.ts
- [ ] Implementar server client Supabase em lib/supabase/server.ts
- [ ] Criar helper parseBriefRow para conversão BriefRow → Brief
- [ ] Configurar RLS policies (owner CRUD + shared briefs públicos)
- [ ] Criar indexes (idx_briefs_anonymous_id, idx_briefs_share_enabled)
- [ ] Habilitar Realtime na tabela briefs
- [ ] **TDD:** createClient retorna instância do Supabase
- [ ] **TDD:** createClient usa variáveis de ambiente corretas
- [ ] **TDD:** createServerClient retorna instância do Supabase
- [ ] **TDD:** createServerClient usa service role key
- [ ] **TDD:** parseBriefRow converte JSONB fields corretamente
- [ ] **TDD:** parseBriefRow mantém metadata (id, anonymous_id, created_at, status)
- [ ] **TDD:** parseBriefRow trata campos JSONB vazios com defaults
- [ ] **TDD:** Migration SQL é válida e contém CREATE TABLE briefs
- [ ] **TDD:** Migration inclui todos os campos obrigatórios

## 4. Design System — [specs/design_system.md](specs/design_system.md)

- [ ] Definir variáveis CSS para tokens de design (dark e light mode)
- [ ] Implementar script inline no head para evitar flash de tema incorreto
- [ ] Configurar dark mode como padrão com persistência em localStorage
- [ ] Criar componente ThemeToggle com ícones sol/lua
- [ ] Implementar persistência de tema no localStorage
- [ ] Atualizar layout.tsx com theme provider
- [ ] Criar componente Header com logo "BriefForge" em Instrument Serif
- [ ] Adicionar link "Histórico" no Header apontando para /history
- [ ] Integrar ThemeToggle no Header
- [ ] Adicionar placeholder para language toggle no Header
- [ ] Tornar Header fixo no topo e responsivo (mobile)
- [ ] Aplicar padrões globais de tipografia (Instrument Serif, Plus Jakarta Sans, IBM Plex Mono)
- [ ] Aplicar padrões de componentes (cards, botões, glass morphism, sombras, transições)
- [ ] **TDD:** ThemeToggle renderiza
- [ ] **TDD:** ThemeToggle alterna de dark para light
- [ ] **TDD:** ThemeToggle alterna de light para dark
- [ ] **TDD:** ThemeToggle persiste no localStorage
- [ ] **TDD:** ThemeToggle inicializa do localStorage
- [ ] **TDD:** Header renderiza logo "BriefForge"
- [ ] **TDD:** Header contém link para histórico
- [ ] **TDD:** Header contém ThemeToggle
- [ ] **TDD:** Header é responsivo
- [ ] **TDD:** Design tokens dark estão definidos
- [ ] **TDD:** Design tokens light estão definidos
- [ ] **TDD:** Accent color é consistente entre temas

## 5. AI Engine (Motor de IA) — [specs/ai_engine.md](specs/ai_engine.md)

- [ ] Configurar OpenRouter como provider com API key do ambiente
- [ ] Criar prompt de sistema para geração de brief (extração + auditoria + scoring)
- [ ] Criar prompt de sistema para re-auditoria de brief editado
- [ ] Implementar API route POST /api/generate com validação de entrada
- [ ] Implementar streaming via streamObject do Vercel AI SDK
- [ ] Implementar retorno como result.toTextStreamResponse()
- [ ] Implementar validação de rawInput não vazio e language válida
- [ ] Implementar tratamento de erros (400 input vazio, 400 language inválida, 500 falha IA)
- [ ] Criar hook useBriefStream com useObject do @ai-sdk/react
- [ ] Implementar método generate(data) que envia rawInput e language para API
- [ ] **TDD:** OpenRouter provider é criado com API key
- [ ] **TDD:** OpenRouter provider expõe modelo
- [ ] **TDD:** generateSystemPrompt retorna string não vazia
- [ ] **TDD:** generateSystemPrompt inclui idioma
- [ ] **TDD:** generateSystemPrompt inclui os 10 campos
- [ ] **TDD:** generateSystemPrompt inclui regras de scoring
- [ ] **TDD:** generateSystemPrompt inclui regra de não inventar
- [ ] **TDD:** auditSystemPrompt retorna string não vazia
- [ ] **TDD:** auditSystemPrompt instrui re-avaliação
- [ ] **TDD:** POST /api/generate retorna stream com input válido
- [ ] **TDD:** POST /api/generate rejeita input vazio
- [ ] **TDD:** POST /api/generate rejeita sem rawInput
- [ ] **TDD:** POST /api/generate rejeita language inválida
- [ ] **TDD:** POST /api/generate trata erro da IA gracefully
- [ ] **TDD:** useBriefStream retorna interface correta
- [ ] **TDD:** useBriefStream.brief inicia como undefined
- [ ] **TDD:** useBriefStream.isLoading inicia como false

## 6. Scoring — [specs/scoring.md](specs/scoring.md)

- [ ] Implementar calculateCompleteness (campos complete/partial/missing)
- [ ] Implementar calculateClarity (heurística baseada em tamanho e especificidade)
- [ ] Implementar calculateCoherence (proporção inversa de contradições)
- [ ] Implementar calculateMeasurability (status do campo KPIs)
- [ ] Implementar calculateScore aplicando pesos (40%, 30%, 20%, 10%)
- [ ] Implementar getScoreColor retornando success/warning/error por faixa
- [ ] Implementar getScoreLabel retornando label textual por faixa
- [ ] Criar componente ScoreDisplay com score numérico e indicador visual
- [ ] Adicionar animação de contagem (Framer Motion) ao ScoreDisplay
- [ ] Configurar fonte IBM Plex Mono no ScoreDisplay
- [ ] **TDD:** calculateCompleteness retorna 100 com todos campos complete
- [ ] **TDD:** calculateCompleteness retorna 0 com todos campos missing
- [ ] **TDD:** calculateCompleteness retorna 50 com todos campos partial
- [ ] **TDD:** calculateCompleteness calcula mix corretamente
- [ ] **TDD:** calculateClarity retorna score alto para conteúdo longo e específico
- [ ] **TDD:** calculateClarity retorna score baixo para conteúdo vago/curto
- [ ] **TDD:** calculateCoherence retorna 100 sem contradições
- [ ] **TDD:** calculateCoherence reduz score proporcionalmente por contradição
- [ ] **TDD:** calculateMeasurability retorna 100 quando KPIs complete
- [ ] **TDD:** calculateMeasurability retorna 0 quando KPIs missing
- [ ] **TDD:** calculateScore aplica pesos corretamente
- [ ] **TDD:** calculateScore retorna 0 para brief vazio
- [ ] **TDD:** calculateScore retorna 100 para brief perfeito
- [ ] **TDD:** calculateScore nunca retorna valor fora de 0-100
- [ ] **TDD:** getScoreColor retorna 'success' para score >= 70
- [ ] **TDD:** getScoreColor retorna 'warning' para score 40-69
- [ ] **TDD:** getScoreColor retorna 'error' para score < 40
- [ ] **TDD:** getScoreLabel retorna labels corretas por faixa
- [ ] **TDD:** ScoreDisplay renderiza o score numérico
- [ ] **TDD:** ScoreDisplay aplica cor correta baseada no score
- [ ] **TDD:** ScoreDisplay exibe label textual
- [ ] **TDD:** ScoreDisplay usa fonte mono IBM Plex Mono

## 7. Input Livre (F1) — [specs/input_livre.md](specs/input_livre.md)

- [ ] Implementar hook useAnonymousId para gerar e persistir UUID no localStorage
- [ ] Criar componente BriefInput com textarea, placeholder contextual e contador de caracteres
- [ ] Implementar botão "Forjar Brief" com estados (disabled, loading) e validação mínima de 10 chars
- [ ] Integrar BriefInput com fluxo de submissão para /api/generate
- [ ] Criar componente BriefCard para exibição de briefs recentes (título, score, data, status)
- [ ] Implementar listagem dos últimos 5 briefs do anonymous_id via Supabase
- [ ] Integrar página Home com Hero Section (heading Instrument Serif + subtitle)
- [ ] Conectar fluxo completo: POST /api/generate → salvar Supabase → redirect /brief/[id]
- [ ] Adicionar funcionalidade "Colar" (clipboard) no BriefInput
- [ ] Implementar estado vazio elegante quando não há briefs recentes
- [ ] **TDD:** useAnonymousId gera ID no primeiro uso
- [ ] **TDD:** useAnonymousId persiste no localStorage
- [ ] **TDD:** useAnonymousId reutiliza ID existente
- [ ] **TDD:** useAnonymousId retorna isReady=true quando ID disponível
- [ ] **TDD:** BriefInput renderiza textarea
- [ ] **TDD:** BriefInput exibe placeholder
- [ ] **TDD:** BriefInput atualiza valor ao digitar
- [ ] **TDD:** BriefInput mostra contador de caracteres
- [ ] **TDD:** BriefInput chama onSubmit com o texto
- [ ] **TDD:** BriefInput desabilita submit com menos de 10 chars
- [ ] **TDD:** BriefInput habilita submit com 10+ chars
- [ ] **TDD:** BriefInput mostra loading state
- [ ] **TDD:** BriefCard renderiza título
- [ ] **TDD:** BriefCard renderiza score com cor correta
- [ ] **TDD:** BriefCard renderiza data relativa
- [ ] **TDD:** BriefCard renderiza status badge
- [ ] **TDD:** BriefCard é clicável e navega
- [ ] **TDD:** Home renderiza heading principal
- [ ] **TDD:** Home renderiza BriefInput
- [ ] **TDD:** Home renderiza seção de recentes
- [ ] **TDD:** Home exibe estado vazio quando não há briefs

## 8. Brief View (F3) — [specs/brief_view.md](specs/brief_view.md)

- [ ] Criar API route GET /api/brief/[id] para carregar brief do Supabase
- [ ] Criar componente FieldStatusBadge com variantes complete/partial/missing
- [ ] Criar componente BriefField para exibir campo individual com status
- [ ] Criar componente AuditPanel para exibir lacunas, contradições e nota geral
- [ ] Criar componente BriefView para layout split-view (brief + auditoria)
- [ ] Criar página /brief/[id] que carrega e exibe o brief
- [ ] Implementar integração de streaming via useBriefStream
- [ ] Implementar animações fade-in staggered nos campos do brief
- [ ] Implementar counter animation para score display
- [ ] **TDD:** GET /api/brief/[id] retorna brief existente
- [ ] **TDD:** GET /api/brief/[id] retorna 404 para brief inexistente
- [ ] **TDD:** GET /api/brief/[id] retorna 400 para ID inválido
- [ ] **TDD:** BriefField renderiza label e conteúdo
- [ ] **TDD:** BriefField renderiza status badge
- [ ] **TDD:** BriefField renderiza suggestion quando partial
- [ ] **TDD:** BriefField não renderiza suggestion quando complete
- [ ] **TDD:** BriefField renderiza estado missing
- [ ] **TDD:** FieldStatusBadge renderiza variante complete
- [ ] **TDD:** FieldStatusBadge renderiza variante partial
- [ ] **TDD:** FieldStatusBadge renderiza variante missing
- [ ] **TDD:** AuditPanel renderiza gaps
- [ ] **TDD:** AuditPanel renderiza gaps com severity correta
- [ ] **TDD:** AuditPanel renderiza contradictions
- [ ] **TDD:** AuditPanel renderiza nota geral
- [ ] **TDD:** AuditPanel renderiza estado vazio
- [ ] **TDD:** BriefView renderiza todos os 10 campos
- [ ] **TDD:** BriefView renderiza split-view
- [ ] **TDD:** BriefView renderiza ScoreDisplay
- [ ] **TDD:** BriefView renderiza título do brief
- [ ] **TDD:** Página /brief/[id] carrega brief
- [ ] **TDD:** Página /brief/[id] mostra loading
- [ ] **TDD:** Página /brief/[id] mostra erro se brief não encontrado

## 9. Editor Inline (F4) — [specs/editor_inline.md](specs/editor_inline.md)

- [ ] Implementar modo edição no BriefField com textarea expansível
- [ ] Adicionar botões "Salvar" e "Cancelar" ao modo edição
- [ ] Criar endpoint PATCH /api/brief/[id] para atualizar campo individual
- [ ] Implementar validação de campo válido e anonymous_id no PATCH
- [ ] Criar endpoint POST /api/audit para re-auditoria com streamObject
- [ ] Implementar recálculo de score no POST /api/audit
- [ ] Adicionar botão "Re-auditar" ao header da brief view
- [ ] Implementar animação de score com recontagem na re-auditoria
- [ ] Implementar feedback visual de sucesso ao salvar (checkmark, borda)
- [ ] Implementar auto-resize de textarea baseado no conteúdo
- [ ] Implementar preenchimento de campos missing com textarea vazia
- [ ] Implementar atualização de badge de status após edição
- [ ] **TDD:** BriefField entra em modo edição ao clicar editar
- [ ] **TDD:** BriefField exibe conteúdo atual na textarea ao editar
- [ ] **TDD:** BriefField permite editar e atualizar valor
- [ ] **TDD:** BriefField salva ao clicar "Salvar" e invoca callback
- [ ] **TDD:** BriefField cancela e restaura conteúdo original
- [ ] **TDD:** BriefField mostra indicador de loading durante save
- [ ] **TDD:** BriefField campo missing exibe textarea vazia com placeholder
- [ ] **TDD:** POST /api/audit retorna stream com status 200
- [ ] **TDD:** POST /api/audit rejeita sem briefId (400)
- [ ] **TDD:** POST /api/audit rejeita sem structured_brief (400)
- [ ] **TDD:** POST /api/audit trata erro da IA (500)
- [ ] **TDD:** PATCH /api/brief/[id] atualiza campo individual
- [ ] **TDD:** PATCH /api/brief/[id] rejeita campo inválido (400)
- [ ] **TDD:** PATCH /api/brief/[id] rejeita anonymous_id incorreto (403)
- [ ] **TDD:** PATCH /api/brief/[id] retorna brief atualizado
- [ ] **TDD:** PATCH /api/brief/[id] atualiza timestamp updated_at

## 10. Brief Vivo (F5) — [specs/brief_vivo.md](specs/brief_vivo.md)

- [ ] Implementar componente ShareButton com geração e cópia de link
- [ ] Configurar rota pública /share/[id] para visualização do cliente
- [ ] Implementar componente BriefClientView com filtragem de campos pendentes
- [ ] Criar componente ClientField com linguagem simplificada e placeholders guiados
- [ ] Implementar endpoint PATCH /api/brief/[id] para atualizar client_inputs
- [ ] Configurar hook useBriefRealtime para subscription em mudanças do brief
- [ ] Implementar componente RealtimeIndicator com status do cliente
- [ ] Adicionar lógica de atualização automática de campos e score ao receber client_inputs
- [ ] **TDD:** ShareButton renderiza botão de compartilhar
- [ ] **TDD:** ShareButton gera link correto
- [ ] **TDD:** ShareButton copia link para clipboard
- [ ] **TDD:** ShareButton mostra feedback de "copiado"
- [ ] **TDD:** ShareButton desabilita se brief não salvo
- [ ] **TDD:** ClientField renderiza label simplificada
- [ ] **TDD:** ClientField renderiza placeholder guiado
- [ ] **TDD:** ClientField permite digitação
- [ ] **TDD:** ClientField exibe conteúdo existente (readonly) para campos complete
- [ ] **TDD:** ClientField chama onSave ao submeter
- [ ] **TDD:** ClientField mostra loading durante save
- [ ] **TDD:** BriefClientView renderiza apenas campos missing/partial
- [ ] **TDD:** BriefClientView não renderiza campos complete
- [ ] **TDD:** BriefClientView renderiza mensagem de boas-vindas
- [ ] **TDD:** BriefClientView renderiza progresso do preenchimento
- [ ] **TDD:** BriefClientView renderiza estado "tudo preenchido"
- [ ] **TDD:** RealtimeIndicator mostra "cliente online"
- [ ] **TDD:** RealtimeIndicator mostra "cliente offline"
- [ ] **TDD:** RealtimeIndicator mostra timestamp último acesso
- [ ] **TDD:** useBriefRealtime retorna brief atualizado
- [ ] **TDD:** useBriefRealtime reconecta após desconexão
- [ ] **TDD:** useBriefRealtime chama callback ao receber update
- [ ] **TDD:** Página /share/[id] carrega brief público
- [ ] **TDD:** Página /share/[id] mostra erro se brief não compartilhado
- [ ] **TDD:** Página /share/[id] renderiza BriefClientView
- [ ] **TDD:** Página /share/[id] salva client_inputs ao preencher

## 11. Exportações (F6) — [specs/exportacoes.md](specs/exportacoes.md)

- [ ] Implementar componente ExportMenu com dropdown (PDF e Markdown)
- [ ] Criar função generateBriefPDF em lib/pdf.ts com @react-pdf/renderer
- [ ] Criar função generateBriefMarkdown em lib/markdown.ts
- [ ] Implementar copy to clipboard com fallback
- [ ] Integrar ExportMenu no header da brief view
- [ ] Adicionar seções no PDF (header, score, campos, pendências, checklist, footer)
- [ ] Estilizar PDF com fontes e cores dos design tokens
- [ ] Incluir seção de auditoria no Markdown
- [ ] Implementar feedback visual (toast) ao copiar Markdown
- [ ] **TDD:** generateBriefMarkdown retorna string não vazia
- [ ] **TDD:** generateBriefMarkdown inclui título
- [ ] **TDD:** generateBriefMarkdown inclui score
- [ ] **TDD:** generateBriefMarkdown inclui todos os 10 campos
- [ ] **TDD:** generateBriefMarkdown inclui status dos campos
- [ ] **TDD:** generateBriefMarkdown inclui suggestions
- [ ] **TDD:** generateBriefMarkdown inclui seção de auditoria
- [ ] **TDD:** generateBriefMarkdown inclui nota geral
- [ ] **TDD:** generateBriefMarkdown inclui footer
- [ ] **TDD:** generateBriefPDF retorna Blob
- [ ] **TDD:** generateBriefPDF inclui título no documento
- [ ] **TDD:** generateBriefPDF inclui todos os 10 campos
- [ ] **TDD:** ExportMenu renderiza botão de exportar
- [ ] **TDD:** ExportMenu abre dropdown com opções
- [ ] **TDD:** ExportMenu chama geração de PDF ao selecionar
- [ ] **TDD:** ExportMenu chama geração de Markdown ao selecionar
- [ ] **TDD:** ExportMenu copia markdown para clipboard

## 12. Histórico (F7) — [specs/historico.md](specs/historico.md)

- [ ] Criar página /history com header "Seus Briefs" e contagem total
- [ ] Implementar carregamento de briefs por anonymous_id (ordenados por updated_at DESC, limit 50)
- [ ] Implementar estado vazio com mensagem e botão "Criar primeiro brief"
- [ ] Implementar loading state na página
- [ ] Expandir BriefCard com barra de score visual com cor
- [ ] Adicionar status badge ao BriefCard (Rascunho, Compartilhado, Completo)
- [ ] Implementar progresso do cliente no BriefCard ("Cliente: X/Y preenchidos")
- [ ] Implementar data relativa formatada ("2h atrás", "ontem")
- [ ] Adicionar hover effects (scale, shadow) ao BriefCard
- [ ] Implementar navegação ao clicar no BriefCard para /brief/[id]
- [ ] Implementar auto-save de briefs após geração e edição
- [ ] Implementar input de busca para filtrar briefs por título (client-side)
- [ ] **TDD:** History page renderiza título "Seus Briefs"
- [ ] **TDD:** History page lista briefs do usuário
- [ ] **TDD:** History page ordena por updated_at DESC
- [ ] **TDD:** History page mostra contagem total
- [ ] **TDD:** History page mostra estado vazio
- [ ] **TDD:** History page mostra loading state
- [ ] **TDD:** History page filtra por busca
- [ ] **TDD:** BriefCard renderiza score bar
- [ ] **TDD:** BriefCard renderiza status "Rascunho"
- [ ] **TDD:** BriefCard renderiza status "Compartilhado"
- [ ] **TDD:** BriefCard renderiza status "Completo"
- [ ] **TDD:** BriefCard mostra progresso do cliente
- [ ] **TDD:** BriefCard renderiza data relativa
- [ ] **TDD:** BriefCard navega ao clicar

## 13. Bilíngue (F8) — [specs/bilingue.md](specs/bilingue.md)

- [ ] Criar Context Provider com estado de locale e persistência em localStorage
- [ ] Criar hook useLocale com locale, setLocale e função t
- [ ] Implementar suporte a interpolação na função de tradução
- [ ] Criar dicionário pt-BR.ts com todas as strings da interface
- [ ] Criar dicionário en.ts com tradução completa
- [ ] Validar consistência entre dicionários (mesmas chaves em ambos)
- [ ] Criar componente LanguageToggle com toggle visual PT/EN
- [ ] Integrar LanguageToggle no Header
- [ ] Integrar LocaleProvider no app/layout.tsx
- [ ] Passar language para API routes (/api/generate e /api/audit)
- [ ] Adicionar instrução de idioma no system prompt da IA
- [ ] Salvar campo language no Supabase ao gerar brief
- [ ] Herdar idioma do brief na tela do cliente
- [ ] **TDD:** LocaleProvider renderiza children
- [ ] **TDD:** LocaleProvider default é pt-BR
- [ ] **TDD:** LocaleProvider permite mudar locale
- [ ] **TDD:** LocaleProvider persiste no localStorage
- [ ] **TDD:** useLocale retorna locale atual
- [ ] **TDD:** useLocale.t traduz chave existente
- [ ] **TDD:** useLocale.t retorna chave se não encontrada
- [ ] **TDD:** useLocale.t suporta interpolação
- [ ] **TDD:** useLocale.t muda ao trocar locale
- [ ] **TDD:** Dicionário PT-BR contém todas as chaves obrigatórias
- [ ] **TDD:** Dicionário EN contém as mesmas chaves que PT-BR
- [ ] **TDD:** Nenhuma chave está vazia
- [ ] **TDD:** LanguageToggle renderiza e alterna idioma ao clicar
