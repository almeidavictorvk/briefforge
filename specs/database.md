# Spec: Database (Supabase)

## Descrição
Configuração do Supabase: tabela `briefs`, clients (browser + server), RLS policies, e helpers de acesso.

## Objetivo
Ter persistência funcional com Supabase, clients prontos para uso em components e API routes.

## Arquivos envolvidos
- `lib/supabase/client.ts` — Supabase browser client (anon key)
- `lib/supabase/server.ts` — Supabase server client (service role, API routes)
- `lib/types.ts` — interface `BriefRow` (tipo da tabela do Supabase)
- `supabase/migrations/001_create_briefs.sql` — migration SQL

## Dependências
- `setup_foundation.md` (projeto base)
- `schema_types.md` (tipos)

## Requisitos

### R1: Tabela `briefs`
```sql
CREATE TABLE briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  structured_brief JSONB NOT NULL DEFAULT '{}',
  audit_results JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  field_scores JSONB DEFAULT '{}',
  title TEXT,
  language TEXT DEFAULT 'pt-BR',
  status TEXT DEFAULT 'draft',
  share_enabled BOOLEAN DEFAULT false,
  client_inputs JSONB DEFAULT '{}',
  client_last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### R2: Indexes
- `idx_briefs_anonymous_id` em `anonymous_id`
- `idx_briefs_share_enabled` em `id` onde `share_enabled = true`

### R3: RLS Policies
- Owner pode SELECT/UPDATE seus briefs (via `anonymous_id`)
- INSERT aberto (com check)
- Briefs compartilhados (`share_enabled = true`) podem ser lidos/atualizados por qualquer um
- Nota: se RLS via headers der problema, fallback para filtro `.eq()` client-side

### R4: Supabase Browser Client (`lib/supabase/client.ts`)
- Usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Exporta função `createClient()` (ou instância singleton)

### R5: Supabase Server Client (`lib/supabase/server.ts`)
- Usa `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
- Para uso exclusivo em API routes (server-side)
- Exporta função `createServerClient()`

### R6: Realtime habilitado
- `ALTER PUBLICATION supabase_realtime ADD TABLE briefs;`

### R7: Helper types
- `BriefRow` — tipo que representa uma row da tabela `briefs`
- Conversão `BriefRow` → `Brief` (parse de JSONB fields)

## TDD — Testes

### Arquivo: `__tests__/lib/supabase/client.test.ts`

1. **createClient retorna instância do Supabase** — chamar `createClient()`, verificar que retorna objeto com `.from()` method
2. **createClient usa variáveis de ambiente corretas** — verificar que o client é criado com a URL e anon key do env

### Arquivo: `__tests__/lib/supabase/server.test.ts`

3. **createServerClient retorna instância do Supabase** — chamar `createServerClient()`, verificar que retorna objeto com `.from()` method
4. **createServerClient usa service role key** — verificar que usa `SUPABASE_SERVICE_ROLE_KEY`

### Arquivo: `__tests__/lib/supabase/helpers.test.ts`

5. **parseBriefRow converte JSONB fields corretamente** — dado um `BriefRow` com `structured_brief` como JSONB, converter para `Brief` com campos tipados
6. **parseBriefRow mantém metadata (id, created_at, etc.)** — verificar que id, anonymous_id, created_at, status são preservados
7. **parseBriefRow trata campos JSONB vazios** — `structured_brief: {}` deve resultar em brief com campos default

### Arquivo: `__tests__/supabase/migration.test.ts`

8. **Migration SQL é válida** — verificar que o arquivo SQL da migration existe e contém CREATE TABLE briefs
9. **Migration inclui todos os campos obrigatórios** — verificar presença de: id, anonymous_id, raw_input, structured_brief, audit_results, score, status, share_enabled, client_inputs

## Critérios de aceite
- [ ] Tabela `briefs` criada no Supabase
- [ ] Browser client funcional
- [ ] Server client funcional
- [ ] Types `BriefRow` definido
- [ ] Helper de conversão `BriefRow` → `Brief`
- [ ] Migration SQL commitada
- [ ] Testes passam com `bun run test`
