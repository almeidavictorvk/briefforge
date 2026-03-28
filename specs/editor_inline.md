# Spec: Editor Inline (F4)

## Descrição
Edição inline de campos do brief pelo account, com re-auditoria automática via IA e recálculo do score.

## Objetivo
Permitir que o account edite qualquer campo do brief e re-audite para atualizar score e auditoria.

## Arquivos envolvidos
- `components/brief-field.tsx` — Atualizar para suportar modo edição
- `app/api/audit/route.ts` — POST endpoint para re-auditar
- `app/api/brief/[id]/route.ts` — PATCH endpoint para salvar edições

## Dependências
- `brief_view.md` (BriefField, BriefView)
- `ai_engine.md` (prompts de auditoria)
- `scoring.md` (recálculo do score)
- `database.md` (salvar no Supabase)

## Requisitos

### R1: Modo edição do BriefField
- Clique no campo (ou botão "editar") ativa modo edição
- Textarea expande no lugar do conteúdo
- Botões: "Salvar" e "Cancelar"
- Salvar → atualiza campo via PATCH `/api/brief/[id]`
- Cancelar → volta ao conteúdo anterior
- Campos missing podem ser preenchidos (textarea vazia com placeholder)

### R2: API Route `PATCH /api/brief/[id]`
- Body: `{ field: string, content: string, anonymousId: string }` (edição de campo individual)
  - OU: `{ structured_brief: object, anonymousId: string }` (atualização completa)
- Valida: campo é um dos 10 campos válidos
- Valida: anonymous_id corresponde ao dono do brief
- Atualiza `structured_brief` no Supabase
- Atualiza `updated_at`
- Retorna brief atualizado

### R3: API Route `POST /api/audit`
- Body: `{ briefId: string, structured_brief: object, language: string }`
- Usa `streamObject` com `auditSystemPrompt` + brief atual
- Reavalia todos os campos → novos status, suggestions
- Recalcula score
- Salva no Supabase: `audit_results`, `score`, `field_scores`
- Retorna stream com resultado da auditoria

### R4: Botão "Re-auditar"
- Aparece no header da brief view
- Ao clicar: chama POST `/api/audit`
- Score "pisca" e re-conta com nova animação
- Audit panel atualiza com novos gaps/contradictions
- Loading state durante re-auditoria

### R5: UX da edição
- Transição suave entre modo view e modo edit
- Textarea auto-resize baseado no conteúdo
- Feedback visual ao salvar (checkmark, borda success momentânea)
- Se o campo mudou de status após edição (ex: missing → partial), badge atualiza

## TDD — Testes

### Arquivo: `__tests__/components/brief-field-edit.test.tsx`

1. **BriefField entra em modo edição ao clicar** — clicar no botão editar, verificar que textarea aparece
2. **BriefField exibe conteúdo atual na textarea** — campo com content "texto X", ao editar, textarea tem value "texto X"
3. **BriefField permite editar o texto** — digitar novo texto na textarea, verificar que value atualiza
4. **BriefField salva ao clicar "Salvar"** — digitar, clicar salvar, verificar que callback onSave é chamado com novo conteúdo
5. **BriefField cancela ao clicar "Cancelar"** — editar, clicar cancelar, verificar que voltou ao conteúdo original
6. **BriefField mostra loading durante save** — mock de save lento, verificar indicador de loading
7. **BriefField campo missing mostra textarea vazia** — campo com status "missing", ao editar, textarea está vazia com placeholder

### Arquivo: `__tests__/api/audit/route.test.ts`

8. **POST /api/audit retorna stream com brief válido** — enviar brief estruturado, verificar status 200
9. **POST /api/audit rejeita sem briefId** — enviar sem briefId, verificar status 400
10. **POST /api/audit rejeita sem structured_brief** — enviar sem brief, verificar status 400
11. **POST /api/audit trata erro da IA** — mockar falha do streamObject, verificar status 500

### Arquivo: `__tests__/api/brief/patch.test.ts`

12. **PATCH /api/brief/[id] atualiza campo individual** — enviar field="context" com novo content, verificar que Supabase é atualizado
13. **PATCH /api/brief/[id] rejeita campo inválido** — enviar field="invalid_field", verificar status 400
14. **PATCH /api/brief/[id] rejeita anonymous_id incorreto** — enviar anonymousId diferente do dono, verificar status 403
15. **PATCH /api/brief/[id] retorna brief atualizado** — após update, verificar que response contém brief com novo conteúdo
16. **PATCH /api/brief/[id] atualiza updated_at** — verificar que timestamp é atualizado

## Critérios de aceite
- [ ] Campos editáveis com modo inline
- [ ] Salvar atualiza no Supabase
- [ ] Re-auditar recalcula score e auditoria
- [ ] Transições suaves entre view/edit
- [ ] Validação de permissões (anonymous_id)
- [ ] Testes passam com `bun run test`
