# Spec: Bilíngue (F8)

## Descrição
Suporte a PT-BR e EN: toggle no header, dicionários de tradução, IA responde no idioma selecionado, interface traduzida.

## Objetivo
Permitir que o usuário alterne entre português e inglês em toda a interface.

## Arquivos envolvidos
- `lib/i18n/context.tsx` — Provider de idioma
- `lib/i18n/pt-BR.ts` — Dicionário português
- `lib/i18n/en.ts` — Dicionário inglês
- `components/language-toggle.tsx` — Switch PT/EN
- `hooks/use-locale.ts` — Hook de idioma
- `app/layout.tsx` — Atualizar com i18n provider

## Dependências
- `setup_foundation.md`
- `design_system.md` (header onde o toggle fica)

## Requisitos

### R1: Context Provider
- `LocaleProvider` com React Context
- State: `locale` (`'pt-BR'` | `'en'`)
- Método: `setLocale(locale)`
- Default: `'pt-BR'` (ou detectar via `navigator.language`)
- Persiste no `localStorage`

### R2: Hook `useLocale`
- Retorna `{ locale, setLocale, t }`
- `t(key)` — função de tradução que busca no dicionário do locale atual
- Suporte a interpolação: `t('greeting', { name: 'Victor' })` → "Olá, Victor!"

### R3: Dicionários
- `pt-BR.ts` — todas as strings da interface em português
- `en.ts` — todas as strings da interface em inglês
- Estrutura flat com namespace por área:
```typescript
{
  'home.title': 'De caos para estratégia.',
  'home.subtitle': 'Cole o pedido do cliente. A IA faz o resto.',
  'home.button': 'Forjar Brief',
  'home.recents': 'Recentes',
  'brief.context': 'Contexto',
  'brief.objective': 'Objetivo',
  // ... todos os campos e textos da UI
  'client.welcome': 'Olá! Sua agência precisa de algumas informações...',
  'client.budget_help': 'Quanto sua empresa pode investir neste projeto?',
  // ...
}
```

### R4: LanguageToggle Component
- Toggle visual PT | EN
- Pill-shaped, estilo clean
- Ao clicar: alterna locale + persiste no localStorage
- Fica no header

### R5: IA responde no idioma selecionado
- `language` é passado para as API routes (`/api/generate`, `/api/audit`)
- System prompt inclui instrução de idioma
- Brief gerado vem no idioma do usuário
- Tela do cliente herda o idioma do brief (salvo no campo `language` do Supabase)

### R6: Prioridade de corte
- Esta spec é a **primeira a ser cortada** se faltar tempo
- Se cortada: manter só PT-BR, sem toggle
- Dicionários devem ser escritos mesmo assim (facilita adicionar EN depois)

## TDD — Testes

### Arquivo: `__tests__/lib/i18n/context.test.tsx`

1. **LocaleProvider renderiza children** — renderizar com children, verificar que aparecem
2. **LocaleProvider default é pt-BR** — renderizar, verificar que locale é 'pt-BR'
3. **LocaleProvider permite mudar locale** — chamar setLocale('en'), verificar que atualiza
4. **LocaleProvider persiste no localStorage** — mudar locale, verificar localStorage

### Arquivo: `__tests__/hooks/use-locale.test.ts`

5. **useLocale retorna locale atual** — renderizar dentro do provider, verificar locale
6. **useLocale.t traduz chave existente** — `t('home.title')` retorna string do dicionário PT-BR
7. **useLocale.t retorna chave se não encontrada** — `t('nonexistent.key')` retorna a própria chave
8. **useLocale.t suporta interpolação** — `t('greeting', { name: 'Victor' })` retorna "Olá, Victor!"
9. **useLocale.t muda ao trocar locale** — trocar para 'en', verificar que `t('home.title')` retorna em inglês

### Arquivo: `__tests__/lib/i18n/dictionaries.test.ts`

10. **Dicionário PT-BR contém todas as chaves obrigatórias** — verificar presença de chaves essenciais
11. **Dicionário EN contém as mesmas chaves que PT-BR** — comparar keys dos dois dicionários
12. **Nenhuma chave está vazia** — verificar que nenhum valor é string vazia

### Arquivo: `__tests__/components/language-toggle.test.tsx`

13. **LanguageToggle renderiza** — verificar presença no DOM
14. **LanguageToggle mostra locale atual** — em PT-BR, mostra indicação visual de PT
15. **LanguageToggle alterna idioma ao clicar** — clicar, verificar que locale muda para EN
16. **LanguageToggle persiste mudança** — clicar, verificar localStorage

## Critérios de aceite
- [ ] Toggle PT/EN funcional no header
- [ ] Toda interface traduzida
- [ ] IA responde no idioma selecionado
- [ ] Locale persiste entre recarregamentos
- [ ] Dicionários PT-BR e EN completos e consistentes
- [ ] Testes passam com `bun run test`
