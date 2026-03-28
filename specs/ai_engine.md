# Spec: AI Engine (Motor de IA)

## Descrição
Configuração do OpenRouter como provider, system prompts (geração + auditoria), API route `/api/generate` com `streamObject`, e hook `useBriefStream` no frontend.

## Objetivo
Receber texto caótico, processar via IA e retornar brief estruturado via streaming progressivo campo a campo.

## Arquivos envolvidos
- `lib/ai/openrouter.ts` — OpenRouter provider config para Vercel AI SDK
- `lib/ai/prompts.ts` — System prompts (generate + audit)
- `lib/ai/schema.ts` — Já definido em `schema_types.md`
- `app/api/generate/route.ts` — POST endpoint com streamObject
- `hooks/use-brief-stream.ts` — Hook com useObject do @ai-sdk/react

## Dependências
- `setup_foundation.md` (projeto base)
- `schema_types.md` (Zod schema)

## Requisitos

### R1: OpenRouter Provider
- Configurar `createOpenRouter` com `OPENROUTER_API_KEY`
- Modelo default: `anthropic/claude-sonnet-4` (configurável)
- Server-side only (chave nunca exposta ao client)

### R2: System Prompt — Geração
O prompt deve instruir a IA a atuar como **estrategista sênior de agência** com 20 anos de experiência:

**Três operações simultâneas:**
1. **EXTRAÇÃO** — Para cada um dos 10 campos:
   - Info clara e suficiente → `status: "complete"`
   - Info vaga ou incompleta → `status: "partial"` + suggestion específica
   - Info não existe → `status: "missing"` + suggestion do que perguntar
2. **AUDITORIA** — Gaps com severity (critical/warning), contradições entre campos, nota geral
3. **SCORING** — 0-100 com pesos: completude 40%, clareza 30%, coerência 20%, mensurabilidade 10%

**Regras invioláveis do prompt:**
- NUNCA inventar informação não presente no input
- Suggestions específicas (nunca "defina melhor")
- Detectar jargão vago e traduzir em direcionamento concreto
- Title descritivo (não "Briefing Novo")
- Responder no idioma selecionado

### R3: System Prompt — Auditoria (re-audit)
- Recebe brief editado (não raw input)
- Reavalia todos os campos
- Recalcula score
- Identifica novas contradições ou gaps resolvidos

### R4: API Route `/api/generate`
- Método: POST
- Body: `{ rawInput: string, language: string }`
- Validar: `rawInput` não vazio, `language` é `'pt-BR'` ou `'en'`
- Usar `streamObject` do Vercel AI SDK com `briefSchema`
- Retornar `result.toTextStreamResponse()`
- Erro: `{ error: "mensagem" }` com status 400/500

### R5: Hook `useBriefStream`
- Usa `useObject` do `@ai-sdk/react`
- Recebe `api: '/api/generate'` e `schema: briefSchema`
- Expõe: `{ brief, generate, isLoading, error }`
- `generate(data)` envia `{ rawInput, language }` para a API
- `brief` é o objeto parcial que vai se construindo via streaming

### R6: Tratamento de erros
- Input vazio → 400 com mensagem clara
- Falha na IA → 500 com mensagem genérica (sem expor detalhes internos)
- Timeout → tratamento graceful

## TDD — Testes

### Arquivo: `__tests__/lib/ai/openrouter.test.ts`

1. **OpenRouter provider é criado com API key** — verificar que `createOpenRouter` é chamado com a key do env
2. **OpenRouter provider expõe modelo** — verificar que o provider permite selecionar modelo (ex: `anthropic/claude-sonnet-4`)

### Arquivo: `__tests__/lib/ai/prompts.test.ts`

3. **generateSystemPrompt retorna string não vazia** — chamar `generateSystemPrompt('pt-BR')`, verificar tipo string e length > 0
4. **generateSystemPrompt inclui idioma** — chamar com `'en'`, verificar que o prompt contém referência ao idioma inglês
5. **generateSystemPrompt inclui os 10 campos** — verificar que o prompt menciona: contexto, objetivo, público, mensagem, tom, entregáveis, orçamento, prazo, KPIs, referências
6. **generateSystemPrompt inclui regras de scoring** — verificar menção a completude (40%), clareza (30%), coerência (20%), mensurabilidade (10%)
7. **generateSystemPrompt inclui regra de não inventar** — verificar que contém instrução de nunca inventar informações
8. **auditSystemPrompt retorna string não vazia** — chamar `auditSystemPrompt('pt-BR')`, verificar tipo string e length > 0
9. **auditSystemPrompt instrui re-avaliação** — verificar que o prompt menciona reavaliar/re-auditar

### Arquivo: `__tests__/api/generate/route.test.ts`

10. **POST /api/generate retorna stream com input válido** — enviar `{ rawInput: "texto teste", language: "pt-BR" }`, verificar status 200 e content-type de streaming
11. **POST /api/generate rejeita input vazio** — enviar `{ rawInput: "", language: "pt-BR" }`, verificar status 400
12. **POST /api/generate rejeita sem rawInput** — enviar `{ language: "pt-BR" }`, verificar status 400
13. **POST /api/generate rejeita language inválida** — enviar `{ rawInput: "texto", language: "fr" }`, verificar status 400
14. **POST /api/generate trata erro da IA gracefully** — mockar falha do streamObject, verificar status 500 com mensagem genérica

### Arquivo: `__tests__/hooks/use-brief-stream.test.ts`

15. **useBriefStream retorna interface correta** — renderizar hook, verificar que retorna `{ brief, generate, isLoading, error }`
16. **useBriefStream.brief inicia como undefined** — verificar estado inicial
17. **useBriefStream.isLoading inicia como false** — verificar estado inicial

## Critérios de aceite
- [ ] OpenRouter configurado e funcional
- [ ] System prompt gera briefs de qualidade a partir de texto caótico
- [ ] Streaming funciona campo a campo
- [ ] API route valida inputs e retorna erros claros
- [ ] Hook `useBriefStream` integra com `useObject`
- [ ] Testes passam com `bun run test`
