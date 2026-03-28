# Spec: Scoring

## Descrição
Lógica de cálculo do score de qualidade do brief (0-100), calculado client-side com pesos definidos. Usado para exibição e ordenação.

## Objetivo
Calcular e exibir um score numérico que reflete a qualidade do brief, permitindo re-cálculo após edições.

## Arquivos envolvidos
- `lib/scoring.ts` — Funções de cálculo do score
- `components/score-display.tsx` — Score circular animado

## Dependências
- `schema_types.md` (tipos BriefField, FieldStatus)

## Requisitos

### R1: Cálculo do score
Score de 0-100 baseado em 4 dimensões com pesos:

| Dimensão | Peso | Cálculo |
|----------|------|---------|
| Completude | 40% | % de campos complete (10 campos) |
| Clareza | 30% | Baseado no content.length e especificidade (heurística) |
| Coerência | 20% | Proporção de contradictions (0 contradições = 100%) |
| Mensurabilidade | 10% | Status do campo KPIs |

### R2: Funções exportadas
- `calculateScore(fields, audit)` — retorna score total (0-100)
- `calculateCompleteness(fields)` — retorna % de completude (0-100)
- `calculateClarity(fields)` — retorna score de clareza (0-100)
- `calculateCoherence(audit)` — retorna score de coerência (0-100)
- `calculateMeasurability(fields)` — retorna score de mensurabilidade (0-100)
- `getScoreColor(score)` — retorna cor: success (>=70), warning (40-69), error (<40)
- `getScoreLabel(score)` — retorna label: "Excelente" (>=80), "Bom" (60-79), "Regular" (40-59), "Fraco" (<40)

### R3: Regras de completude
- `complete` = 100% do peso do campo
- `partial` = 50% do peso do campo
- `missing` = 0%
- Cada campo tem peso igual (10% cada, somando 100%)

### R4: Score Display Component
- Exibe score numérico (ex: "87")
- Indicador visual (barra ou círculo) com cor baseada no score
- Animação de contagem de 0 ao valor (Framer Motion)
- Label textual do score
- Fonte mono (IBM Plex Mono)

### R5: Re-cálculo
- Score recalcula quando campos são editados
- Score recalcula quando cliente preenche campos no Brief Vivo

## TDD — Testes

### Arquivo: `__tests__/lib/scoring.test.ts`

1. **calculateCompleteness retorna 100 quando todos os campos são complete** — 10 campos complete → 100
2. **calculateCompleteness retorna 0 quando todos os campos são missing** — 10 campos missing → 0
3. **calculateCompleteness retorna 50 para campos partial** — 10 campos partial → 50
4. **calculateCompleteness calcula mix corretamente** — 5 complete + 3 partial + 2 missing → (5*100 + 3*50 + 2*0) / 10 = 65
5. **calculateClarity retorna score baseado no tamanho do conteúdo** — campos com conteúdo longo e específico → score alto
6. **calculateClarity retorna score baixo para conteúdo vago** — campos com conteúdo curto/vago → score baixo
7. **calculateCoherence retorna 100 sem contradições** — audit com 0 contradictions → 100
8. **calculateCoherence reduz score por contradição** — audit com 2 contradictions → score reduzido proporcionalmente
9. **calculateMeasurability retorna 100 quando KPIs são complete** — campo kpis com status complete → 100
10. **calculateMeasurability retorna 0 quando KPIs são missing** — campo kpis com status missing → 0
11. **calculateScore aplica pesos corretamente** — brief com completude 100, clareza 50, coerência 100, mensurabilidade 0 → (100*0.4 + 50*0.3 + 100*0.2 + 0*0.1) = 75
12. **calculateScore retorna 0 para brief completamente vazio** — todos missing, sem conteúdo, sem KPIs → 0
13. **calculateScore retorna 100 para brief perfeito** — todos complete, conteúdo extenso, 0 contradições, KPIs complete → ~100
14. **calculateScore nunca retorna valor fora de 0-100** — testar edge cases extremos
15. **getScoreColor retorna 'success' para score >= 70** — score 85 → 'success'
16. **getScoreColor retorna 'warning' para score 40-69** — score 55 → 'warning'
17. **getScoreColor retorna 'error' para score < 40** — score 20 → 'error'
18. **getScoreLabel retorna label correta** — 85 → "Excelente", 65 → "Bom", 45 → "Regular", 20 → "Fraco"

### Arquivo: `__tests__/components/score-display.test.tsx`

19. **ScoreDisplay renderiza o score numérico** — renderizar com score=87, verificar "87" no DOM
20. **ScoreDisplay aplica cor correta** — score=85 deve ter cor success, score=30 deve ter cor error
21. **ScoreDisplay exibe label** — score=85 deve exibir "Excelente"
22. **ScoreDisplay usa fonte mono** — verificar classe de fonte IBM Plex Mono no elemento do score

## Critérios de aceite
- [ ] Score calcula corretamente com pesos definidos
- [ ] Todas as 4 dimensões implementadas
- [ ] Cores e labels corretas para cada faixa
- [ ] ScoreDisplay renderiza com animação
- [ ] Testes passam com `bun run test`
