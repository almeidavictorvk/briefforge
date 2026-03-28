# Spec: Schema & Types

## Descrição
Definição do Zod schema do brief (usado pelo `streamObject`), TypeScript interfaces globais e tipos compartilhados.

## Objetivo
Ter schemas Zod validados e tipos TypeScript que são a fundação de toda a comunicação entre frontend, API e banco de dados.

## Arquivos envolvidos
- `lib/ai/schema.ts` — Zod schema do brief (briefSchema, fieldSchema)
- `lib/types.ts` — TypeScript interfaces globais (Brief, BriefField, AuditResult, etc.)

## Dependências
- `setup_foundation.md` (projeto base configurado)

## Requisitos

### R1: fieldSchema (Zod)
```typescript
{
  content: string,       // Conteúdo extraído
  status: 'complete' | 'partial' | 'missing',
  suggestion: string?    // Sugestão se partial/missing
}
```

### R2: briefSchema (Zod)
```typescript
{
  title: string,
  fields: {
    context: fieldSchema,
    objective: fieldSchema,
    audience: fieldSchema,
    message: fieldSchema,
    tone: fieldSchema,
    deliverables: fieldSchema,
    budget: fieldSchema,
    timeline: fieldSchema,
    kpis: fieldSchema,
    references: fieldSchema,
  },
  audit: {
    gaps: [{ field: string, severity: 'critical' | 'warning', suggestion: string }],
    contradictions: [{ description: string, fields: string[] }],
    overall_note: string,
  },
  score: number (0-100),
}
```

### R3: TypeScript interfaces (`lib/types.ts`)
- `BriefField` — espelha fieldSchema
- `BriefFields` — objeto com os 10 campos
- `AuditGap` — lacuna individual
- `AuditContradiction` — contradição individual
- `AuditResults` — gaps + contradictions + overall_note
- `Brief` — type completo do brief (inclui metadata do Supabase)
- `BriefStatus` — `'draft' | 'shared' | 'complete'`
- `FieldName` — union type dos 10 nomes de campos
- `FieldStatus` — `'complete' | 'partial' | 'missing'`

### R4: Lista dos 10 campos (constante exportada)
- Array com os nomes dos campos para iteração
- Objeto com labels de cada campo (em PT-BR e EN)

### R5: Compatibilidade Schema ↔ Types
- Os tipos TypeScript devem ser deriváveis do Zod schema via `z.infer`
- Nunca duplicar definições manualmente

## TDD — Testes

### Arquivo: `__tests__/lib/ai/schema.test.ts`

1. **fieldSchema valida campo completo** — parse de `{ content: "texto", status: "complete" }` deve suceder
2. **fieldSchema valida campo com suggestion** — parse de `{ content: "", status: "missing", suggestion: "Pergunte X" }` deve suceder
3. **fieldSchema rejeita status inválido** — parse de `{ content: "", status: "invalid" }` deve falhar com ZodError
4. **fieldSchema rejeita sem content** — parse de `{ status: "complete" }` deve falhar
5. **briefSchema valida brief completo** — parse de um brief com todos os 10 campos, audit e score deve suceder
6. **briefSchema rejeita score fora do range** — parse com `score: 150` deve falhar
7. **briefSchema rejeita score negativo** — parse com `score: -10` deve falhar
8. **briefSchema rejeita campo faltando** — parse sem o campo `budget` em fields deve falhar
9. **briefSchema valida audit com gaps** — parse de audit com array de gaps (field, severity, suggestion) deve suceder
10. **briefSchema valida audit com contradictions** — parse de audit com contradictions (description, fields[]) deve suceder
11. **briefSchema rejeita severity inválida** — gap com `severity: "info"` deve falhar

### Arquivo: `__tests__/lib/types.test.ts`

12. **FIELD_NAMES contém exatamente 10 campos** — verificar que a constante tem length 10
13. **FIELD_NAMES contém todos os campos esperados** — verificar presença de context, objective, audience, message, tone, deliverables, budget, timeline, kpis, references
14. **z.infer<typeof briefSchema> é compatível com Brief type** — verificar que um objeto tipado como Brief satisfaz o schema (type-level test)

## Critérios de aceite
- [ ] `briefSchema.parse()` valida briefs corretos
- [ ] `briefSchema.parse()` rejeita briefs inválidos com mensagens claras
- [ ] Tipos TypeScript derivados do Zod schema via `z.infer`
- [ ] Todos os 10 campos do brief estão definidos
- [ ] Testes passam com `bun run test`
