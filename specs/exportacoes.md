# Spec: Exportações (F6)

## Descrição
Exportação do brief em PDF estilizado e Markdown (copy to clipboard).

## Objetivo
Permitir que o account exporte o brief para compartilhar com equipes ou arquivar.

## Arquivos envolvidos
- `components/export-menu.tsx` — Dropdown de exportação (PDF, Markdown)
- `lib/pdf.ts` — Geração de PDF
- `lib/markdown.ts` — Geração de Markdown

## Dependências
- `schema_types.md` (tipos Brief, BriefField)
- `scoring.md` (score para incluir no export)
- `brief_view.md` (brief data)
- `design_system.md` (tokens para estilizar PDF)

## Requisitos

### R1: ExportMenu Component
- Dropdown com duas opções: "PDF" e "Markdown"
- Ícone de download
- Ao selecionar PDF: gera e faz download do arquivo
- Ao selecionar Markdown: copia para clipboard + toast "Copiado!"
- Aparece no header da brief view

### R2: Geração de PDF (`lib/pdf.ts`)
- Usa `@react-pdf/renderer` para layout em React
- Conteúdo:
  - Header: logo "BriefForge" + título do brief + data
  - Score de qualidade (numérico + barra visual)
  - Todos os 10 campos com:
    - Label
    - Conteúdo
    - Status (Completo/Parcial/Ausente)
    - Suggestion (se partial/missing)
  - Seção "Pendências" (campos still missing/partial)
  - Seção "Checklist para Criação" (resumo: o que produzir, pra quem, tom, deadline)
  - Footer: "Gerado por BriefForge" + data
- Estilo:
  - Fontes do projeto (ou fallback compatível com react-pdf)
  - Cores dos design tokens
  - Layout limpo e profissional
- Exporta função: `generateBriefPDF(brief: Brief): Promise<Blob>`

### R3: Geração de Markdown (`lib/markdown.ts`)
- Formato:
```markdown
# {título}

**Score:** {score}/100 | **Status:** {status}
**Gerado em:** {data}

---

## Contexto
{conteúdo}
> Status: {status}
> Sugestão: {suggestion}

## Objetivo
{conteúdo}
...

---

## Auditoria

### Lacunas
- [{severity}] {campo}: {suggestion}

### Contradições
- {description} (campos: {fields})

### Nota Geral
{overall_note}

---

*Gerado por BriefForge*
```
- Exporta função: `generateBriefMarkdown(brief: Brief): string`

### R4: Copy to clipboard
- Usar `navigator.clipboard.writeText()`
- Feedback visual (toast ou animação no botão)
- Fallback para `document.execCommand('copy')` se clipboard API não disponível

## TDD — Testes

### Arquivo: `__tests__/lib/markdown.test.ts`

1. **generateBriefMarkdown retorna string não vazia** — brief válido → string com length > 0
2. **generateBriefMarkdown inclui título** — verificar que markdown contém o título do brief
3. **generateBriefMarkdown inclui score** — verificar presença do score no output
4. **generateBriefMarkdown inclui todos os 10 campos** — verificar que todos os campos aparecem como headings
5. **generateBriefMarkdown inclui status dos campos** — verificar que status (Completo/Parcial/Ausente) aparece
6. **generateBriefMarkdown inclui suggestions** — campo partial com suggestion → suggestion aparece no output
7. **generateBriefMarkdown inclui seção de auditoria** — verificar seção "Auditoria" com gaps e contradictions
8. **generateBriefMarkdown inclui nota geral** — verificar overall_note no output
9. **generateBriefMarkdown inclui footer** — verificar "Gerado por BriefForge" no final

### Arquivo: `__tests__/lib/pdf.test.ts`

10. **generateBriefPDF retorna Blob** — brief válido → resultado é instância de Blob (ou buffer)
11. **generateBriefPDF inclui título no documento** — verificar que o componente React inclui o título
12. **generateBriefPDF inclui todos os 10 campos** — verificar que o componente renderiza 10 seções de campos

### Arquivo: `__tests__/components/export-menu.test.tsx`

13. **ExportMenu renderiza botão de exportar** — verificar presença do botão/trigger
14. **ExportMenu abre dropdown com opções** — clicar no trigger, verificar "PDF" e "Markdown" como opções
15. **ExportMenu chama geração de PDF ao selecionar** — clicar "PDF", verificar que callback onExportPDF é chamado
16. **ExportMenu chama geração de Markdown ao selecionar** — clicar "Markdown", verificar que callback onExportMarkdown é chamado
17. **ExportMenu copia markdown para clipboard** — mockar clipboard, selecionar Markdown, verificar clipboard.writeText chamado

## Critérios de aceite
- [ ] PDF gerado com layout profissional
- [ ] Markdown formatado e copiável
- [ ] Export menu funcional com feedback
- [ ] PDF inclui score, campos, auditoria e checklist
- [ ] Clipboard copy com fallback
- [ ] Testes passam com `bun run test`
