# Spec: Histórico (F7)

## Descrição
Página de histórico com lista de briefs salvos, auto-save, filtro por status, e navegação para abrir/editar briefs.

## Objetivo
Permitir que o account veja todos os seus briefs, com score e status, e reabra qualquer um para editar.

## Arquivos envolvidos
- `app/history/page.tsx` — Página de histórico
- `components/brief-card.tsx` — Card de brief na lista (já definido em `input_livre.md`, expandido aqui)

## Dependências
- `setup_foundation.md`
- `design_system.md`
- `database.md` (Supabase client, queries)
- `schema_types.md` (tipos)
- `input_livre.md` (BriefCard base)

## Requisitos

### R1: Página `/history`
- Header: "Seus Briefs" + contagem total
- Lista de briefs do anonymous_id, ordenados por `updated_at` DESC
- Loading state enquanto carrega
- Estado vazio: mensagem + botão "Criar primeiro brief"

### R2: BriefCard (expandido)
Além do definido em `input_livre.md`:
- Score bar visual (barra de progresso com cor)
- Status badge: "Rascunho" (draft), "Compartilhado" (shared), "Completo" (complete)
- Se compartilhado: indicador de progresso do cliente ("Cliente: 2/3 preenchidos")
- Data relativa: "2h atrás", "ontem", "3 dias atrás"
- Hover effects (scale, shadow)
- Click → navega para `/brief/[id]`

### R3: Auto-save
- Briefs são salvos automaticamente após geração
- Briefs são atualizados automaticamente após edição
- Não precisa de botão "salvar" explícito
- `updated_at` é sempre atualizado

### R4: Carregamento de dados
- Usar Supabase client com `.eq('anonymous_id', anonymousId)`
- Select: `id, title, score, status, share_enabled, client_inputs, created_at, updated_at`
- Ordenar por `updated_at` DESC
- Limit: 50 (paginação futura se necessário)

### R5: Busca (nice-to-have)
- Input de busca por título
- Filtra client-side (lista já carregada)

## TDD — Testes

### Arquivo: `__tests__/app/history.test.tsx`

1. **History page renderiza título "Seus Briefs"** — verificar heading no DOM
2. **History page lista briefs do usuário** — mockar Supabase com 3 briefs, verificar 3 cards renderizados
3. **History page ordena por updated_at DESC** — verificar que o brief mais recente aparece primeiro
4. **History page mostra contagem total** — 3 briefs → "Seus Briefs (3)"
5. **History page mostra estado vazio** — mockar Supabase sem dados, verificar mensagem e botão de criar
6. **History page mostra loading** — antes dos dados carregarem, verificar indicador de loading
7. **History page filtra por busca** — digitar no campo de busca, verificar que lista filtra por título

### Arquivo: `__tests__/components/brief-card-full.test.tsx`

8. **BriefCard renderiza score bar** — score=75 deve mostrar barra com preenchimento proporcional
9. **BriefCard renderiza status "Rascunho"** — status="draft" → badge "Rascunho"
10. **BriefCard renderiza status "Compartilhado"** — status="shared" → badge "Compartilhado"
11. **BriefCard renderiza status "Completo"** — status="complete" → badge "Completo"
12. **BriefCard mostra progresso do cliente** — shared + client_inputs com 2 de 3 → "Cliente: 2/3"
13. **BriefCard renderiza data relativa** — created_at de 2h atrás → "2h atrás"
14. **BriefCard navega ao clicar** — click → verifica href para `/brief/[id]`

## Critérios de aceite
- [ ] Lista de briefs carrega do Supabase
- [ ] Cards exibem título, score, status, data
- [ ] Ordenação por data de atualização
- [ ] Estado vazio elegante
- [ ] Briefs compartilhados mostram progresso do cliente
- [ ] Click navega para o brief
- [ ] Testes passam com `bun run test`
