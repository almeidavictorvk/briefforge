# Spec: Input Livre (F1)

## Descrição
Tela home com textarea generosa para colar texto caótico, botão "Forjar Brief", lista de briefs recentes, e integração com o streaming de IA.

## Objetivo
Permitir que o account cole qualquer formato de texto e inicie a geração do brief com um clique.

## Arquivos envolvidos
- `app/page.tsx` — Home page
- `components/brief-input.tsx` — Textarea de input livre
- `components/brief-card.tsx` — Card de brief recente (preview)
- `hooks/use-anonymous-id.ts` — Hook de anonymous ID

## Dependências
- `setup_foundation.md` (projeto base)
- `design_system.md` (header, tokens, tema)
- `schema_types.md` (tipos)
- `ai_engine.md` (hook useBriefStream)
- `database.md` (Supabase client para listar recentes)

## Requisitos

### R1: Hero Section
- Heading grande em Instrument Serif: "De caos para estratégia."
- Subtitle em Plus Jakarta Sans: "Cole o pedido do cliente. A IA faz o resto."
- Layout seguindo padrões de `reference.html` (heading oversized, ênfase mista)

### R2: Textarea (BriefInput component)
- Grande e generosa (mínimo 6 linhas, expansível)
- Placeholder contextual: "Cole aqui a transcrição, email, mensagem de WhatsApp, notas de reunião..."
- Botão "Colar" (ícone clipboard) que cola do clipboard
- Sem validação de formato — aceita qualquer texto
- Mínimo de caracteres: 10 (para evitar submits vazios)
- Counter de caracteres (sutil)

### R3: Botão "Forjar Brief"
- Pill-shaped, accent color
- Texto: "Forjar Brief"
- Desabilitado se textarea vazia ou com menos de 10 chars
- Loading state durante geração (spinner/animação)
- Ao clicar: chama `useBriefStream.generate()` → salva no Supabase → redireciona para `/brief/[id]`

### R4: Briefs Recentes
- Lista abaixo do input
- Mostra últimos 5 briefs do anonymous_id
- Cada item: título, score (mini), data relativa, status
- Usa componente `BriefCard`
- Se não há briefs: estado vazio elegante

### R5: Anonymous ID
- Hook `useAnonymousId`:
  - Verifica `localStorage` para ID existente
  - Se não existe, gera UUID v4 e salva
  - Retorna `{ anonymousId, isReady }`
- Usado para associar briefs ao usuário sem auth

### R6: Fluxo de geração
1. Usuário cola texto
2. Clica "Forjar Brief"
3. POST para `/api/generate` com `{ rawInput, language }`
4. Simultaneamente, cria row no Supabase com `raw_input` e `anonymous_id`
5. Streaming inicia → redireciona para `/brief/[id]` onde o streaming continua
6. Brief salva/atualiza no Supabase quando streaming completa

### R7: BriefCard component
- Título do brief
- Score em mini (número + cor)
- Data relativa ("2h atrás", "ontem")
- Status badge (draft/shared/complete)
- Click → navega para `/brief/[id]`
- Hover effects seguindo reference.html

## TDD — Testes

### Arquivo: `__tests__/hooks/use-anonymous-id.test.ts`

1. **useAnonymousId gera ID no primeiro uso** — renderizar hook sem localStorage, verificar que retorna anonymousId não vazio
2. **useAnonymousId persiste no localStorage** — renderizar, verificar que `localStorage.getItem('briefforge-anonymous-id')` não é null
3. **useAnonymousId reutiliza ID existente** — setar ID no localStorage antes, renderizar, verificar que retorna o mesmo ID
4. **useAnonymousId retorna isReady=true quando ID está disponível** — verificar flag isReady

### Arquivo: `__tests__/components/brief-input.test.tsx`

5. **BriefInput renderiza textarea** — verificar presença de textarea no DOM
6. **BriefInput exibe placeholder** — verificar texto de placeholder
7. **BriefInput atualiza valor ao digitar** — simular typing, verificar value da textarea
8. **BriefInput mostra contador de caracteres** — digitar texto, verificar que o counter exibe o número correto
9. **BriefInput chama onSubmit com o texto** — digitar texto, clicar submit, verificar que callback recebe o texto
10. **BriefInput desabilita submit com menos de 10 chars** — digitar 5 chars, verificar botão desabilitado
11. **BriefInput habilita submit com 10+ chars** — digitar 15 chars, verificar botão habilitado
12. **BriefInput mostra loading state** — passar prop isLoading=true, verificar estado de loading no botão

### Arquivo: `__tests__/components/brief-card.test.tsx`

13. **BriefCard renderiza título** — passar title="Campanha X", verificar no DOM
14. **BriefCard renderiza score com cor correta** — score=85 deve ter cor success
15. **BriefCard renderiza data relativa** — passar created_at recente, verificar "há X minutos/horas"
16. **BriefCard renderiza status badge** — status="shared" deve mostrar badge correspondente
17. **BriefCard é clicável e navega** — verificar que é um link para `/brief/[id]`

### Arquivo: `__tests__/app/home.test.tsx`

18. **Home renderiza heading principal** — verificar "De caos para estratégia" no DOM
19. **Home renderiza BriefInput** — verificar presença da textarea
20. **Home renderiza seção de recentes** — verificar presença de seção "Recentes" (ou similar)
21. **Home exibe estado vazio quando não há briefs** — mockar Supabase sem dados, verificar mensagem de estado vazio

## Critérios de aceite
- [ ] Textarea funcional com placeholder e contador
- [ ] Botão "Forjar Brief" com estados (disabled, loading)
- [ ] Anonymous ID gerado e persistido
- [ ] Briefs recentes listados
- [ ] Clique no botão inicia geração e redireciona
- [ ] Visual segue reference.html
- [ ] Testes passam com `bun run test`
