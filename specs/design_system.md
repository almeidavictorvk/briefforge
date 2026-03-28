# Spec: Design System

## Descrição
Design tokens, fontes, tema dark/light, CSS variables, componentes base (header, theme toggle) e estilos globais seguindo a direção estética "Editorial Refinado".

## Objetivo
Ter a fundação visual do projeto pronta: tokens, tema, fontes, header com navegação e toggles.

## Arquivos envolvidos
- `styles/globals.css` — CSS variables, Tailwind base, tokens
- `components/header.tsx` — Header com logo, nav, toggles
- `components/theme-toggle.tsx` — Switch dark/light
- `app/layout.tsx` — Atualizar com theme provider
- `lib/types.ts` — `Theme` type

## Dependências
- `setup_foundation.md` (projeto base com Tailwind e fontes)

## Requisitos

### R1: CSS Variables (design tokens)
Definir em `:root` (light) e `.dark` (dark):

| Token | Dark | Light |
|-------|------|-------|
| `--bg` | `#0A0A0A` | `#FAFAF7` |
| `--surface` | `#141414` | `#FFFFFF` |
| `--surface-hover` | `#1E1E1E` | `#F5F5F0` |
| `--border` | `#2A2A2A` | `#E8E6E1` |
| `--text` | `#F5F5F0` | `#1A1A1A` |
| `--text-secondary` | `#A8A49E` | `#6B6560` |
| `--text-muted` | `#706C66` | `#9B9590` |
| `--accent` | `#E8553A` | `#E8553A` |
| `--success` | `#22C55E` | `#16A34A` |
| `--warning` | `#EAB308` | `#CA8A04` |
| `--error` | `#EF4444` | `#DC2626` |

### R2: Dark mode default
- HTML inicia com classe `dark`
- Persistir preferência no `localStorage`
- Sem flash de tema errado no carregamento (script inline no head)

### R3: Theme Toggle
- Componente `ThemeToggle` com ícone sol/lua
- Alterna classe `dark` no `<html>`
- Salva no `localStorage`
- Transição suave entre temas

### R4: Header
- Logo "BriefForge" em Instrument Serif
- Link para "Histórico" (`/history`)
- Theme toggle
- Language toggle (placeholder — implementado na spec `bilingue`)
- Fixo no topo
- Responsivo (mobile: hamburger ou simplificado)

### R5: Tipografia global
- Headings: Instrument Serif, `font-light`, `leading-[0.95]`, `tracking-tight`
- Body: Plus Jakarta Sans
- Mono: IBM Plex Mono (scores, dados)
- Labels: uppercase, tracking largo, text-xs

### R6: Padrões de componentes (seguindo reference.html)
- Cards com `rounded-3xl` ou `rounded-2xl`
- Botões pill-shaped `rounded-full`
- Glass morphism onde aplicável
- Sombras `shadow-2xl shadow-stone-900/20`
- Hover scale `hover:scale-105`, `active:scale-95`
- Transições `duration-300` a `duration-700`

## TDD — Testes

### Arquivo: `__tests__/components/theme-toggle.test.tsx`

1. **ThemeToggle renderiza** — renderizar componente, verificar que está no DOM
2. **ThemeToggle alterna de dark para light** — clicar no toggle, verificar que `<html>` perde classe `dark`
3. **ThemeToggle alterna de light para dark** — iniciar em light, clicar, verificar que `<html>` ganha classe `dark`
4. **ThemeToggle persiste no localStorage** — clicar para light, verificar que `localStorage.getItem('theme')` é `'light'`
5. **ThemeToggle inicializa do localStorage** — setar `localStorage` como `'light'` antes de renderizar, verificar que inicia sem classe `dark`

### Arquivo: `__tests__/components/header.test.tsx`

6. **Header renderiza logo "BriefForge"** — verificar texto "BriefForge" no DOM
7. **Header contém link para histórico** — verificar link com href `/history`
8. **Header contém ThemeToggle** — verificar presença do botão de toggle de tema
9. **Header é responsivo** — verificar que em viewport mobile os elementos essenciais ainda são acessíveis

### Arquivo: `__tests__/styles/tokens.test.ts`

10. **Design tokens dark estão definidos** — ler `globals.css`, verificar presença das CSS variables no seletor `.dark`
11. **Design tokens light estão definidos** — verificar presença das CSS variables no seletor `:root`
12. **Accent color é consistente entre temas** — verificar que `--accent` é `#E8553A` em ambos os temas

## Critérios de aceite
- [ ] Tokens CSS definidos e funcionais
- [ ] Dark mode é default, com toggle funcional
- [ ] Header renderiza com logo, nav e toggles
- [ ] Fontes carregam corretamente (Instrument Serif, Plus Jakarta Sans, IBM Plex Mono)
- [ ] Tema persiste entre recarregamentos
- [ ] Visual segue direção "Editorial Refinado"
- [ ] Testes passam com `bun run test`
