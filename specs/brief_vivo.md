# Spec: Brief Vivo (F5)

## Descrição
Link compartilhável onde o cliente preenche campos missing/parciais com linguagem simples. Diferencial principal do produto. Inclui: share button, client view, client fields, realtime updates.

## Objetivo
Permitir que o account compartilhe um link com o cliente, e o cliente preencha as lacunas do brief de forma intuitiva, com updates em tempo real para o account.

## Arquivos envolvidos
- `app/share/[id]/page.tsx` — Tela pública do cliente
- `components/brief-client-view.tsx` — View simplificada do cliente
- `components/client-field.tsx` — Campo para cliente preencher
- `components/share-button.tsx` — Botão de compartilhar + gera link
- `components/realtime-indicator.tsx` — Indicador "cliente está preenchendo"
- `lib/supabase/realtime.ts` — Hook de subscription para brief updates
- `hooks/use-brief-realtime.ts` — Hook de Supabase Realtime
- `app/api/brief/[id]/route.ts` — PATCH (atualizar client_inputs)

## Dependências
- `brief_view.md` (brief field, brief view)
- `database.md` (Supabase client, realtime)
- `schema_types.md` (tipos)
- `design_system.md` (tokens, componentes)

## Requisitos

### R1: ShareButton Component
- Botão "Compartilhar com Cliente"
- Ao clicar:
  1. Atualiza brief no Supabase: `share_enabled = true`, `status = 'shared'`
  2. Gera link: `{origin}/share/{briefId}`
  3. Copia link para clipboard
  4. Mostra toast/feedback "Link copiado!"
- Se já compartilhado: mostra "Link copiado" com opção de copiar novamente
- Ícone de compartilhamento + texto

### R2: Tela do Cliente (`/share/[id]`)
- Rota pública — sem autenticação
- Carrega brief via `GET /api/brief/[id]` (permitido porque `share_enabled = true`)
- Se brief não existe ou não é compartilhado: mensagem de erro amigável
- Layout: mobile-first, clean, acolhedor
- Header simplificado: logo BriefForge + título do brief
- Mensagem de boas-vindas: "Olá! Sua agência precisa de algumas informações para dar vida ao seu projeto."

### R3: BriefClientView Component
- Filtra apenas campos com status `partial` ou `missing`
- Ordena: missing primeiro (mais urgentes), depois partial
- Cada campo usa `ClientField` component
- Progresso: "X de Y campos preenchidos"
- Quando todos preenchidos: mensagem de agradecimento

### R4: ClientField Component
- **Linguagem simplificada** — sem jargão de agência:
  - "Orçamento" → "Quanto sua empresa pode investir neste projeto? Mesmo um range aproximado nos ajuda."
  - "Público-alvo" → "Quem você quer atingir? Pense na pessoa que compraria seu produto."
  - "KPIs" → "Como medir o sucesso? O que significaria 'deu certo' pra você?"
  - (mapping completo para os 10 campos)
- Se `partial`: mostra conteúdo parcial existente como contexto + textarea para complementar
- Se `missing`: textarea vazia com placeholder guiado
- Botão "Salvar" individual por campo
- Feedback ao salvar: checkmark animado
- Design: cards com border-radius grande, espaço generoso

### R5: Salvar input do cliente
- PATCH `/api/brief/[id]` com:
  - `{ client_inputs: { [fieldName]: "conteúdo do cliente" } }`
  - Atualiza `client_last_seen` com timestamp
- Merge: client_inputs são mergeados com inputs anteriores (não sobrescreve)
- Após save, campo muda visual para "salvo" (não remove da tela, mas marca como feito)

### R6: Realtime para o Account
- Supabase Realtime subscription na tabela `briefs` para o brief específico
- Hook `useBriefRealtime(briefId)`:
  - Subscribe a changes no brief
  - Quando `client_inputs` atualiza → atualiza state do brief na tela do account
  - Quando `client_last_seen` atualiza → mostra indicator "Cliente está online"
- Fallback: polling a cada 5s se Realtime falhar

### R7: RealtimeIndicator Component
- Mostra quando o cliente está ativo (client_last_seen < 30s atrás)
- Dot pulsante verde + "Cliente está preenchendo..."
- Badge: "Cliente preencheu X de Y campos pendentes"
- Desaparece quando cliente fecha a aba (timeout 30s)

### R8: Atualização do brief com client_inputs
- Quando o account recebe inputs do cliente:
  - Campos parciais → conteúdo do cliente complementa
  - Campos missing → conteúdo do cliente preenche
  - Status pode mudar: missing → partial/complete, partial → complete
  - Score recalcula automaticamente

## TDD — Testes

### Arquivo: `__tests__/components/share-button.test.tsx`

1. **ShareButton renderiza** — verificar presença do botão "Compartilhar com Cliente"
2. **ShareButton ativa compartilhamento ao clicar** — clicar, verificar que callback onShare é chamado
3. **ShareButton copia link para clipboard** — mockar clipboard API, verificar que link é copiado
4. **ShareButton mostra feedback "Link copiado"** — após clicar, verificar texto de confirmação
5. **ShareButton mostra estado "já compartilhado"** — quando brief já é shared, mostrar visual diferente

### Arquivo: `__tests__/components/client-field.test.tsx`

6. **ClientField renderiza com linguagem simplificada** — campo "budget" deve exibir texto acessível, não "Orçamento" técnico
7. **ClientField renderiza textarea para missing** — campo missing mostra textarea vazia
8. **ClientField renderiza contexto existente para partial** — campo partial mostra conteúdo parcial + textarea
9. **ClientField salva ao clicar "Salvar"** — digitar texto, clicar salvar, verificar callback
10. **ClientField mostra feedback de sucesso ao salvar** — após save, verificar indicador visual de sucesso
11. **ClientField desabilita save com textarea vazia** — sem texto, botão salvar desabilitado

### Arquivo: `__tests__/components/brief-client-view.test.tsx`

12. **BriefClientView filtra apenas campos missing e partial** — brief com 7 complete + 2 missing + 1 partial → mostra apenas 3 campos
13. **BriefClientView ordena missing antes de partial** — verificar ordem dos campos exibidos
14. **BriefClientView mostra progresso** — verificar "X de Y campos preenchidos"
15. **BriefClientView mostra mensagem quando tudo preenchido** — todos os campos preenchidos → mensagem de agradecimento
16. **BriefClientView renderiza mensagem de boas-vindas** — verificar texto acolhedor no topo

### Arquivo: `__tests__/components/realtime-indicator.test.tsx`

17. **RealtimeIndicator mostra "cliente online" quando ativo** — client_last_seen recente → mostra dot + texto
18. **RealtimeIndicator oculta quando inativo** — client_last_seen > 30s → não mostra
19. **RealtimeIndicator mostra contagem de campos preenchidos** — "Cliente preencheu 2 de 3 campos"

### Arquivo: `__tests__/hooks/use-brief-realtime.test.ts`

20. **useBriefRealtime inicia subscription** — renderizar hook, verificar que subscribe é chamado com o briefId
21. **useBriefRealtime atualiza state quando recebe update** — simular evento realtime, verificar que brief state atualiza
22. **useBriefRealtime limpa subscription no unmount** — unmount hook, verificar que unsubscribe é chamado

### Arquivo: `__tests__/app/share-page.test.tsx`

23. **Página /share/[id] carrega brief compartilhado** — mockar API com brief shared, verificar BriefClientView renderiza
24. **Página /share/[id] mostra erro se brief não compartilhado** — mockar 403, verificar mensagem de erro
25. **Página /share/[id] mostra erro se brief não existe** — mockar 404, verificar mensagem de erro
26. **Página /share/[id] atualiza client_last_seen ao carregar** — verificar que PATCH é chamado com timestamp

## Critérios de aceite
- [ ] Share button gera e copia link
- [ ] Tela do cliente mostra apenas campos pendentes
- [ ] Linguagem simplificada (sem jargão)
- [ ] Cliente pode preencher e salvar campos individualmente
- [ ] Realtime: account vê updates do cliente ao vivo
- [ ] Indicador "cliente online" funcional
- [ ] Score atualiza quando cliente preenche
- [ ] Mobile-friendly
- [ ] Testes passam com `bun run test`
