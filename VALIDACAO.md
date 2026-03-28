# VALIDACAO.md — Guia de Teste End-to-End do BriefForge

Passo a passo para testar manualmente todas as funcionalidades do app, de cabo a rabo.

**Pre-requisitos:**
- `bun dev` rodando (`http://localhost:3000`)
- Variáveis de ambiente configuradas (`.env.local`): `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Supabase com a tabela `briefs` criada e Realtime habilitado
- Dois browsers/abas abertos (um para Account, outro para Cliente)

---

## Fase 1 — Home Page (`/`)

### 1.1 Carregamento inicial
- [ x] Acessar `http://localhost:3000`
- [x ] Verificar que a home carrega sem erros no console
- [ x] Header aparece com logo "BriefForge", navegação e toggle dark/light
- [ x] Modo dark é o padrão
- [ x] Textarea de input está visível e vazia
- [ x] Seção "Briefs recentes" aparece (vazia se primeiro uso)

### 1.2 Toggle de tema
- [x ] Clicar no toggle dark/light no header
- [ x] Tema muda para light — cores, backgrounds e textos se adaptam
- [ x] Recarregar a página — tema persiste (salvo no localStorage)
- [ x] Voltar para dark mode

### 1.3 Input livre — validação
- [ x] Tentar submeter com textarea vazia — botão deve estar desabilitado
- [ x] Digitar menos de 10 caracteres — botão continua desabilitado
- [ x] Digitar 10+ caracteres — botão "Forjar Brief" habilita
- [ x] Contador de caracteres aparece e atualiza em tempo real

### 1.4 Botão "Colar"
- [ x] Copiar um texto qualquer para o clipboard
- [ x] Clicar no botão "Colar" na textarea
- [ x] Texto do clipboard aparece na textarea

### 1.5 Submissão do input
Use este texto de exemplo (cole na textarea):

```
Oi, tudo bem? Então, a gente precisa fazer uma campanha pro lançamento do novo app de delivery
da empresa. O nome é FoodRush. O público é jovem, 18-30 anos, que mora em cidade grande.
A gente quer aumentar downloads em 50% no primeiro mês. Orçamento tá apertado, uns 15 mil reais.
Precisa de posts pra Instagram e TikTok, talvez uns vídeos curtos. O tom tem que ser descolado,
jovem, com humor. Prazo: precisamos de tudo pronto até final de abril. Ah, a gente se inspira
muito no iFood e no Rappi, aquelas campanhas criativas que eles fazem.
```

- [x ] Colar o texto acima e clicar "Forjar Brief"
- [ x] Loading aparece no botão
- [ x] Página redireciona para `/brief/{id}?streaming=true`
- [ ] Anotar o ID do brief: `8516b5ad-29b6-41e0-bb44-1a4aa16cda6d`

---

## Fase 2 — Geração com Streaming (`/brief/[id]`)

### 2.1 Streaming de IA
- [ x] Após redirect, a página de brief carrega
- [ x] Streaming começa automaticamente — campos vão aparecendo progressivamente
- [ x] Título do brief aparece (ex: "Campanha de Lançamento FoodRush")
- [ x] Score aparece e anima de 0 até o valor final
- [ x] Os 10 campos vão populando um a um com animação staggered
- [ x] Painel de auditoria (direita) popula com gaps e contradições

### 2.2 Campos gerados
Verificar que os 10 campos foram preenchidos pela IA:
- [ ] **Contexto** — deve mencionar app de delivery, FoodRush
- [ ] **Objetivo** — deve mencionar 50% downloads, SMART se possível
- [ ] **Público-alvo** — 18-30 anos, cidades grandes
- [ ] **Mensagem principal** — algo sobre conveniência/delivery
- [ ] **Tom de voz** — descolado, jovem, humor
- [ ] **Entregáveis** — Instagram, TikTok, vídeos curtos
- [ ] **Orçamento** — R$ 15.000
- [ ] **Prazo** — final de abril
- [ ] **KPIs** — provavelmente parcial ou missing
- [ ] **Referências** — iFood, Rappi

### 2.3 Status dos campos
- [ ] Campos com informação completa mostram badge verde "Completo"
- [ ] Campos com informação parcial mostram badge amarelo "Parcial"
- [ ] Campos sem informação mostram badge vermelho "Ausente"
- [ ] Campos missing/parciais mostram sugestão da IA (ícone de lâmpada)

### 2.4 Score
- [ ] Score numérico aparece (ex: 65/100)
- [ ] Cor do score corresponde à faixa (verde >= 70, amarelo 40-69, vermelho < 40)
- [ ] Label do score aparece (Excelente/Bom/Regular/Fraco)

### 2.5 Auditoria
- [ ] Painel de auditoria à direita mostra lista de gaps
- [ ] Cada gap mostra: campo afetado + severidade (crítico/alerta) + sugestão
- [ ] Se houver contradições, aparecem listadas
- [ ] Nota geral do estrategista aparece no final

### 2.6 Persistência pós-streaming
- [ ] Recarregar a página (F5) — brief carrega do banco, não restreama
- [ ] Todos os campos, score e auditoria permanecem iguais
- [ ] URL não tem mais `?streaming=true`

---

## Fase 3 — Edição Inline de Campos

### 3.1 Editar um campo
- [ ] Clicar no ícone de edição (lápis) de um campo parcial ou missing
- [ ] Textarea de edição aparece com o conteúdo atual (ou vazia se missing)
- [ ] Digitar novo conteúdo ou complementar o existente
- [ ] Clicar "Salvar"
- [ ] Checkmark verde aparece momentaneamente
- [ ] Conteúdo atualizado aparece no campo
- [ ] Status do campo atualiza (ex: missing → complete)

### 3.2 Cancelar edição
- [ ] Clicar no lápis de outro campo
- [ ] Clicar "Cancelar"
- [ ] Conteúdo original permanece inalterado

### 3.3 Editar campo de KPIs (provavelmente missing)
- [ ] Clicar no lápis do campo KPIs
- [ ] Digitar: "Downloads do app, taxa de retenção D7, CAC abaixo de R$5, NPS > 50"
- [ ] Salvar
- [ ] Campo agora aparece como "Completo"

---

## Fase 4 — Re-Auditoria

### 4.1 Re-auditar manualmente
- [ ] Clicar no botão "Re-auditar"
- [ ] Loading aparece enquanto IA reavalia
- [ ] Score recalcula — deve subir se campos foram completados
- [ ] Gaps atualizados no painel de auditoria (menos gaps agora)
- [ ] Campos editados refletem novo status

### 4.2 Re-auditoria automática
- [ ] Se todos os 10 campos ficarem "Completo", a re-auditoria dispara automaticamente
- [ ] Score deve subir significativamente (70+)
- [ ] Painel de auditoria pode mostrar "Nenhuma lacuna encontrada"

---

## Fase 5 — Compartilhar com Cliente (Brief Vivo)

### 5.1 Ativar compartilhamento
- [ ] Clicar no botão "Compartilhar com Cliente"
- [ ] Botão muda para "Copiar link"
- [ ] Link `/share/{id}` é copiado para o clipboard
- [ ] Anotar o link: `_______________________`

### 5.2 Verificar status
- [ ] Status do brief deve mudar para "Compartilhado"
- [ ] Indicador de realtime aparece no header (mas sem atividade do cliente ainda)

---

## Fase 6 — Brief Vivo: Visão do Cliente (`/share/[id]`)

**Abrir em uma segunda aba/browser** (simula o cliente externo).

### 6.1 Carregamento
- [ ] Abrir o link `/share/{id}` copiado
- [ ] Página carrega com o título do brief
- [ ] Barra de progresso mostra "X de Y campos preenchidos"
- [ ] Apenas campos pendentes (missing/parciais) aparecem — campos completos ficam ocultos
- [ ] Labels simplificados aparecem (linguagem de cliente, não técnica)

### 6.2 Preencher campo missing
- [ ] Encontrar um campo missing (ex: KPIs, se não editou antes)
- [ ] Placeholder com exemplo/guia aparece na textarea
- [ ] Digitar informação relevante
- [ ] Clicar "Salvar"
- [ ] Campo some da lista de pendentes (ou muda para complete)
- [ ] Progresso atualiza ("X+1 de Y campos preenchidos")

### 6.3 Complementar campo parcial
- [ ] Encontrar um campo parcial
- [ ] Conteúdo existente (da IA) aparece acima da textarea
- [ ] Digitar complemento
- [ ] Salvar
- [ ] Campo atualiza

### 6.4 Completar todos os campos pendentes
- [ ] Preencher todos os campos pendentes restantes
- [ ] Quando tudo estiver preenchido, mensagem "Obrigado! Todas as informações foram preenchidas." aparece

---

## Fase 7 — Realtime: Account Vê Updates do Cliente

**Voltar para a primeira aba** (visão do Account em `/brief/[id]`).

### 7.1 Indicador de atividade
- [ ] Indicador "Cliente está preenchendo..." aparece (com dot pulsante verde)
- [ ] Progresso do cliente aparece: "X de Y campos pendentes"

### 7.2 Dados do cliente aparecem
- [ ] Campos que o cliente preencheu aparecem atualizados
- [ ] Para campos que eram missing: conteúdo do cliente aparece
- [ ] Para campos parciais: conteúdo original + "Complemento do cliente" aparece
- [ ] Status dos campos atualiza em tempo real (ou após polling de 5s)

### 7.3 Re-auditoria com inputs do cliente
- [ ] Se todos os campos ficaram completos, re-auditoria deve disparar automaticamente
- [ ] Score deve aumentar
- [ ] Verificar que a auditoria reflete os novos dados

---

## Fase 8 — Exportações

### 8.1 Exportar como Markdown
- [ ] Na página `/brief/[id]`, clicar no menu "Exportar"
- [ ] Selecionar "Markdown"
- [ ] Toast "Copiado!" aparece
- [ ] Colar em um editor de texto — verificar que o markdown tem:
  - Título do brief
  - Score
  - Todos os 10 campos com status
  - Seção de auditoria (gaps, contradições, nota geral)
  - Rodapé "Gerado por BriefForge"

### 8.2 Exportar como PDF
- [ ] Clicar no menu "Exportar"
- [ ] Selecionar "PDF"
- [ ] Download do PDF inicia
- [ ] Abrir o PDF e verificar:
  - Header com logo e título
  - Score com barra de progresso colorida
  - Todos os 10 campos com badges de status
  - Seção "Pendências" (se houver)
  - "Checklist para Criação" no final
  - Footer com data de geração

---

## Fase 9 — Histórico (`/history`)

### 9.1 Lista de briefs
- [ ] Navegar para `/history`
- [ ] Brief recém-criado aparece na lista
- [ ] Card mostra: título, score (com barra colorida), status, data relativa

### 9.2 Busca
- [ ] Digitar parte do título na barra de busca (ex: "FoodRush")
- [ ] Lista filtra mostrando apenas briefs que correspondem
- [ ] Limpar busca — todos os briefs voltam

### 9.3 Abrir brief do histórico
- [ ] Clicar em um brief card
- [ ] Redireciona para `/brief/[id]`
- [ ] Brief carrega com todos os dados (campos, score, auditoria)

### 9.4 Status no histórico
- [ ] Briefs com status "draft" mostram badge "Rascunho"
- [ ] Briefs com status "shared" mostram badge "Compartilhado"
- [ ] Briefs compartilhados mostram progresso do cliente (se houver)

---

## Fase 10 — Briefs Recentes na Home

### 10.1 Lista na home
- [ ] Voltar para `/`
- [ ] Seção "Briefs recentes" mostra os últimos 5 briefs
- [ ] Cards com título, score, status e data
- [ ] Clicar em um card abre o brief correspondente

---

## Fase 11 — Edge Cases e Erros

### 11.1 Brief inexistente
- [ ] Acessar `/brief/uuid-invalido-qualquer`
- [ ] Mensagem de erro ou 404 aparece (não crashar)

### 11.2 Share de brief não compartilhado
- [ ] Criar um novo brief (sem compartilhar)
- [ ] Acessar `/share/{id-do-novo-brief}` diretamente
- [ ] Deve mostrar erro/bloqueio (brief não está compartilhado)

### 11.3 Input muito curto
- [ ] Na home, digitar "oi" (< 10 chars)
- [ ] Botão "Forjar Brief" permanece desabilitado

### 11.4 Refresh durante streaming
- [ ] Criar novo brief e durante o streaming (campos ainda aparecendo), dar F5
- [ ] Brief deve carregar do banco com os dados parciais que já foram salvos
- [ ] Não deve crashar ou ficar em loop

### 11.5 Múltiplas abas do mesmo brief
- [ ] Abrir `/brief/{id}` em duas abas
- [ ] Editar um campo na aba 1 e salvar
- [ ] Recarregar a aba 2 — deve mostrar o campo atualizado

---

## Fase 12 — Segundo Brief (Fluxo Completo Rápido)

Repetir o fluxo com um input diferente para garantir consistência.

### 12.1 Novo input
Cole na home:

```
Preciso de uma apresentação institucional pra Acme Corp. Somos uma empresa de tecnologia
B2B que vende software de gestão para PMEs. Queremos reposicionar a marca como premium.
Não tenho ideia de orçamento ainda. Prazo é ontem rs. Público são decisores de TI em
empresas de 50-500 funcionários.
```

- [ ] Submeter e verificar que streaming funciona
- [ ] Score deve ser mais baixo (menos informação)
- [ ] Mais campos missing/parciais
- [ ] Mais gaps na auditoria
- [ ] Brief aparece no histórico junto com o anterior

### 12.2 Verificar isolamento
- [ ] O segundo brief é independente do primeiro
- [ ] Cada brief tem seu próprio ID, score, campos e auditoria
- [ ] Histórico mostra ambos

---

## Checklist Final

- [ ] Todos os 10 campos do brief funcionam (exibição, edição, status)
- [ ] Streaming de IA gera brief a partir de input caótico
- [ ] Re-auditoria recalcula score e atualiza gaps
- [ ] Compartilhamento gera link funcional
- [ ] Cliente consegue preencher campos pendentes via `/share`
- [ ] Account manager vê updates do cliente em tempo real (ou polling)
- [ ] Exportação PDF gera arquivo com layout correto
- [ ] Exportação Markdown copia texto formatado
- [ ] Histórico lista briefs com busca funcional
- [ ] Dark/light mode funciona e persiste
- [ ] Nenhum erro no console do browser em fluxo normal
- [ ] Dados persistem no Supabase (verificar no dashboard se quiser)

---

## Notas

- **Realtime pode ter delay de 1-5s** dependendo da conexão com Supabase. Se não atualizar imediatamente, aguardar ou recarregar.
- **Score varia** dependendo da interpretação da IA — não espere valores exatos, apenas faixas razoáveis.
- **PDF é gerado client-side** — pode demorar 1-2s em briefs grandes.
- **Se algo falhar**, abrir o console do browser (F12 → Console) e anotar o erro para debug.
