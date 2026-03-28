# Spec: Setup & Foundation

## Descrição
Configuração inicial do projeto: Next.js 16 App Router, Tailwind CSS 4, shadcn/ui, TypeScript, Vitest, estrutura de pastas e dependências base.

## Objetivo
Ter o projeto rodando com todas as dependências configuradas, pronto para receber as features.

## Arquivos envolvidos
- `package.json` — dependências
- `next.config.ts` — configuração Next.js
- `tsconfig.json` — configuração TypeScript
- `app/layout.tsx` — root layout com providers
- `app/page.tsx` — home page (placeholder)
- `styles/globals.css` — Tailwind base + CSS variables
- `vitest.config.ts` — configuração do Vitest
- `vitest.setup.ts` — setup global de testes

## Dependências
Nenhuma (spec base).

## Requisitos

### R1: Projeto Next.js 16 com App Router
- TypeScript strict habilitado
- App Router (pasta `app/`)
- Server components por padrão

### R2: Tailwind CSS 4
- Configurado com design tokens do projeto (CSS variables)
- Dark mode como default (class strategy)

### R3: shadcn/ui
- Inicializado e configurado
- Tema customizado com tokens do BriefForge

### R4: Vitest configurado
- `vitest.config.ts` com paths do TypeScript
- `@testing-library/react` + `@testing-library/jest-dom` configurados
- Setup file com matchers do jest-dom
- Scripts no package.json: `test`, `test:watch`, `test:coverage`
- JSDOM como environment para testes de componentes

### R5: Estrutura de pastas
```
app/
components/
  ui/
lib/
  supabase/
  ai/
  i18n/
hooks/
styles/
__tests__/
specs/
```

### R6: Fontes
- Instrument Serif (display) — via Google Fonts / next/font
- Plus Jakarta Sans (body) — via Google Fonts / next/font
- IBM Plex Mono (mono) — via Google Fonts / next/font

### R7: Root Layout
- Providers: theme (dark default)
- Fontes carregadas
- Meta tags básicas
- `globals.css` importado

## TDD — Testes

### Arquivo: `__tests__/setup/vitest-config.test.ts`

1. **Vitest está configurado e roda** — executar `bun run test` sem erros
2. **Path aliases funcionam** — importar de `@/lib/types` e `@/components/` sem erro

### Arquivo: `__tests__/app/layout.test.tsx`

3. **Root layout renderiza children** — renderizar layout com children, verificar que children aparecem no DOM
4. **Root layout aplica classe de fonte body** — verificar que o body tem a classe da fonte Plus Jakarta Sans
5. **Root layout aplica dark mode por padrão** — verificar que o html tem classe `dark`

### Arquivo: `__tests__/app/home.test.tsx`

6. **Home page renderiza sem erros** — renderizar `page.tsx` da home, verificar que não dá erro

## Critérios de aceite
- [ ] `bun run dev` inicia sem erros
- [ ] `bun run build` compila sem erros
- [ ] `bun run test` executa e passa
- [ ] `bun run lint` passa sem warnings
- [ ] Fontes carregam corretamente
- [ ] Dark mode é o default
