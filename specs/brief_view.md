# Spec: Brief View (F3)

## Descrição
Tela de visualização do brief gerado (`/brief/[id]`): split-view com brief à esquerda e auditoria à direita, status por campo, score display, e streaming progressivo.

## Objetivo
Exibir o brief completo com auditoria, score e status visual de cada campo, com suporte a streaming.

## Arquivos envolvidos
- `app/brief/[id]/page.tsx` — Página do brief (account view)
- `components/brief-view.tsx` — Visualização completa do brief
- `components/brief-field.tsx` — Campo individual do brief
- `components/field-status-badge.tsx` — Badge de status (complete/partial/missing)
- `components/audit-panel.tsx` — Painel lateral de auditoria
- `components/score-display.tsx` — Já definido em `scoring.md`
- `app/api/brief/[id]/route.ts` — GET endpoint para carregar brief

## Dependências
- `setup_foundation.md`
- `design_system.md`
- `schema_types.md`
- `scoring.md` (ScoreDisplay)
- `ai_engine.md` (useBriefStream para streaming)
- `database.md` (carregar brief do Supabase)

## Requisitos

### R1: Página `/brief/[id]`
- Carrega brief do Supabase via API route `GET /api/brief/[id]`
- Se vem de geração recente: continua streaming via `useBriefStream`
- Se vem do histórico: carrega brief completo já salvo
- Header da página: botão voltar, título do brief, score, botões de ação

### R2: API Route `GET /api/brief/[id]`
- Retorna dados do brief pelo ID
- Valida que o ID é UUID válido
- Se brief não existe: 404
- Se brief existe mas não pertence ao anonymous_id e não é compartilhado: 403
- Retorna: `{ brief: Brief }`

### R3: Split-View Layout
- **Esquerda (60-65%):** Brief completo com campos
- **Direita (35-40%):** Painel de auditoria
- Responsivo: em mobile, auditoria vai abaixo do brief (stacked)
- Gap generoso entre as colunas

### R4: BriefField Component
- Exibe: label do campo + conteúdo + status badge + suggestion (se existir)
- Status visual claro:
  - Complete: borda/fundo success
  - Partial: borda/fundo warning
  - Missing: borda/fundo error
- Se streaming: campo aparece com fade-in animation (Framer Motion staggered)
- Clicável para editar (implementado na spec `editor_inline`)

### R5: FieldStatusBadge Component
- Três variantes: complete (check), partial (warning), missing (x)
- Cores dos design tokens (success, warning, error)
- Texto: "Completo", "Parcial", "Ausente"
- Pulse animation sutil nos missing

### R6: AuditPanel Component
- Seção "Lacunas" com lista de gaps:
  - Ícone severity (critical = vermelho, warning = amarelo)
  - Campo referenciado
  - Suggestion da IA
- Seção "Contradições" com lista (se houver):
  - Descrição da contradição
  - Campos envolvidos
- Seção "Nota Geral":
  - Texto da avaliação da IA
- Se streaming: seções aparecem conforme dados chegam

### R7: Streaming UX
- Campos aparecem um a um com staggered fade-in
- Score conta de 0 ao valor final quando streaming termina
- Audit panel popula progressivamente
- Indicador de loading enquanto streaming está ativo

### R8: Ações do header
- Botão "Compartilhar" (implementado na spec `brief_vivo`)
- Botão "Exportar" (implementado na spec `exportacoes`)
- Botão "Re-auditar" (implementado na spec `editor_inline`)
- Botão voltar (→ `/`)

## TDD — Testes

### Arquivo: `__tests__/api/brief/route.test.ts`

1. **GET /api/brief/[id] retorna brief existente** — mockar Supabase com brief, verificar status 200 e dados corretos
2. **GET /api/brief/[id] retorna 404 para brief inexistente** — mockar Supabase sem resultado, verificar status 404
3. **GET /api/brief/[id] retorna 400 para ID inválido** — enviar ID não-UUID, verificar status 400

### Arquivo: `__tests__/components/brief-field.test.tsx`

4. **BriefField renderiza label e conteúdo** — passar campo com label "Contexto" e content "texto", verificar ambos no DOM
5. **BriefField renderiza status badge** — campo complete deve mostrar badge complete
6. **BriefField renderiza suggestion quando partial** — campo partial com suggestion deve exibir a suggestion
7. **BriefField não renderiza suggestion quando complete** — campo complete não deve exibir suggestion
8. **BriefField renderiza estado missing** — campo missing deve exibir visual diferente (placeholder)

### Arquivo: `__tests__/components/field-status-badge.test.tsx`

9. **FieldStatusBadge renderiza variante complete** — status="complete" mostra texto "Completo" com cor success
10. **FieldStatusBadge renderiza variante partial** — status="partial" mostra texto "Parcial" com cor warning
11. **FieldStatusBadge renderiza variante missing** — status="missing" mostra texto "Ausente" com cor error

### Arquivo: `__tests__/components/audit-panel.test.tsx`

12. **AuditPanel renderiza gaps** — passar 2 gaps, verificar que ambos aparecem
13. **AuditPanel renderiza gaps com severity correta** — gap critical tem indicador visual diferente de warning
14. **AuditPanel renderiza contradictions** — passar 1 contradição, verificar que aparece com descrição e campos
15. **AuditPanel renderiza nota geral** — verificar que overall_note aparece
16. **AuditPanel renderiza estado vazio** — sem gaps nem contradições, mostrar mensagem positiva

### Arquivo: `__tests__/components/brief-view.test.tsx`

17. **BriefView renderiza todos os 10 campos** — passar brief completo, verificar 10 BriefFields no DOM
18. **BriefView renderiza split-view** — verificar layout com duas colunas (brief + audit)
19. **BriefView renderiza ScoreDisplay** — verificar presença do score
20. **BriefView renderiza título do brief** — verificar título no DOM

### Arquivo: `__tests__/app/brief-page.test.tsx`

21. **Página /brief/[id] carrega brief** — mockar API, verificar que BriefView renderiza com dados do brief
22. **Página /brief/[id] mostra loading enquanto carrega** — verificar estado de loading antes dos dados chegarem
23. **Página /brief/[id] mostra erro se brief não encontrado** — mockar 404, verificar mensagem de erro

## Critérios de aceite
- [ ] Brief carrega e exibe todos os 10 campos com status
- [ ] Split-view funcional (brief + auditoria)
- [ ] Score display com animação
- [ ] Status badges corretos (complete/partial/missing)
- [ ] Audit panel com gaps, contradições e nota geral
- [ ] Streaming: campos aparecem progressivamente
- [ ] Responsivo (mobile: stacked layout)
- [ ] Testes passam com `bun run test`
