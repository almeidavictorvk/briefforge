import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre — BriefForge',
  description:
    'Conheça o BriefForge: a ferramenta de IA que transforma inputs bagunçados em briefings estruturados e auditados.',
}

// ---------------------------------------------------------------------------
// Feature card data
// ---------------------------------------------------------------------------

const features = [
  {
    number: '01',
    title: 'Input Livre',
    description:
      'Cole qualquer coisa — transcrição de call, e-mail, mensagem de WhatsApp, notas soltas. A IA entende o caos e extrai o que importa.',
  },
  {
    number: '02',
    title: 'Auditoria Inteligente',
    description:
      'Cada campo do brief recebe um status: completo, parcial ou ausente. Nada passa batido. Contradições e riscos são sinalizados automaticamente.',
  },
  {
    number: '03',
    title: 'Score de Qualidade',
    description:
      'Um score de 0 a 100 avalia completude, clareza, coerência e mensurabilidade. Você sabe exatamente onde o brief precisa melhorar.',
  },
  {
    number: '04',
    title: 'Brief Vivo',
    description:
      'Gere um link e envie ao cliente. Ele vê apenas o que falta, em linguagem simples, e preenche. O brief atualiza em tempo real.',
  },
  {
    number: '05',
    title: 'Edição Inline',
    description:
      'Cada campo é editável direto na interface. Ao salvar, a IA re-audita e recalcula o score automaticamente.',
  },
  {
    number: '06',
    title: 'Exportação',
    description:
      'Exporte o brief finalizado em PDF estilizado ou copie como Markdown. Pronto para apresentar ou documentar.',
  },
]

// ---------------------------------------------------------------------------
// Pain points
// ---------------------------------------------------------------------------

const painPoints = [
  {
    before: 'Transcrições de 40 minutos',
    after: 'Brief estruturado em segundos',
  },
  {
    before: '"Me manda o que ficou faltando"',
    after: 'Link com campos para o cliente preencher',
  },
  {
    before: 'Planilhas e docs desatualizados',
    after: 'Brief vivo, sempre na versão mais recente',
  },
  {
    before: 'Briefings incompletos aprovados',
    after: 'Score e auditoria impedem isso',
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SobrePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
        {/* Watermark */}
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16vw] font-display font-light text-text/[0.04] pointer-events-none select-none whitespace-nowrap"
        >
          BriefForge
        </span>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-8">
            Sobre o projeto
          </span>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[0.95] text-text">
            De caos para{' '}
            <span className="italic text-accent">estratégia</span>
            <br />
            em minutos.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            BriefForge é a ferramenta de IA que transforma inputs bagunçados de
            clientes em briefings estruturados e auditados — com um link
            compartilhável para o cliente preencher o que falta.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* A dor */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12 bg-surface border-y border-bf-border">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            O problema
          </span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text mb-6 leading-[1.1]">
            Todo projeto começa com um{' '}
            <span className="italic text-accent">briefing ruim</span>.
          </h2>

          <p className="text-text-secondary text-lg max-w-3xl leading-relaxed mb-16">
            O cliente manda um e-mail confuso, uma transcrição de call de 40
            minutos, mensagens soltas no WhatsApp. O Account tenta montar um
            brief, mas sempre falta informação. O projeto começa torto. Retrabalho
            vira rotina. Ninguém sabe quem aprovou o quê.
          </p>

          {/* Before / After grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="rounded-2xl border border-bf-border bg-bg p-6 flex items-start gap-4 group hover:border-accent/30 transition-colors duration-300"
              >
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center text-xs font-mono font-semibold">
                    !
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-text-muted text-sm line-through mb-1">
                    {point.before}
                  </p>
                  <p className="text-text font-medium">{point.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Como funciona */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            Como funciona
          </span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text mb-16 leading-[1.1]">
            Três passos. Zero{' '}
            <span className="italic text-accent">fricção</span>.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group">
              <div className="rounded-3xl bg-surface border border-bf-border p-8 h-full transition-all duration-300 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5">
                <span className="font-mono text-5xl font-light text-bf-border group-hover:text-accent/40 transition-colors duration-500">
                  01
                </span>
                <h3 className="font-display text-xl text-text mt-4 mb-3">
                  Cole o input
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Qualquer formato: e-mail, transcrição, notas, mensagens. Cole
                  tudo no campo de texto e clique em gerar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="rounded-3xl bg-surface border border-bf-border p-8 h-full transition-all duration-300 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5">
                <span className="font-mono text-5xl font-light text-bf-border group-hover:text-accent/40 transition-colors duration-500">
                  02
                </span>
                <h3 className="font-display text-xl text-text mt-4 mb-3">
                  IA estrutura e audita
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  A IA extrai 10 campos estratégicos, avalia completude e
                  clareza, e gera um score de qualidade do brief.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="rounded-3xl bg-surface border border-bf-border p-8 h-full transition-all duration-300 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5">
                <span className="font-mono text-5xl font-light text-bf-border group-hover:text-accent/40 transition-colors duration-500">
                  03
                </span>
                <h3 className="font-display text-xl text-text mt-4 mb-3">
                  Compartilhe o Brief Vivo
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Gere um link e envie ao cliente. Ele preenche o que falta. O
                  brief atualiza em tempo real para você.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Features */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12 bg-surface border-y border-bf-border">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            Funcionalidades
          </span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text mb-16 leading-[1.1]">
            Tudo que um brief{' '}
            <span className="italic text-accent">precisa</span>.
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-2xl border border-bf-border bg-bg p-6 group hover:border-accent/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-text-muted mt-1">
                    {feature.number}
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-text mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Duas personas */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            Para quem
          </span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text mb-16 leading-[1.1]">
            Duas personas,{' '}
            <span className="italic text-accent">um produto</span>.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Account */}
            <div className="rounded-3xl bg-surface border border-bf-border p-8 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors duration-500" />
              <span className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-6">
                Interno
              </span>
              <h3 className="font-display text-2xl text-text mb-4">
                O Account
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Cola o texto caótico do cliente, a IA extrai e audita o brief com
                score de qualidade. Edita inline, compartilha o link com o cliente
                e exporta quando estiver pronto.
              </p>
            </div>

            {/* Cliente */}
            <div className="rounded-3xl bg-surface border border-bf-border p-8 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-success/10 transition-colors duration-500" />
              <span className="inline-block text-xs font-medium uppercase tracking-widest text-success mb-6">
                Externo
              </span>
              <h3 className="font-display text-2xl text-text mb-4">
                O Cliente
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Recebe um link simples. Vê apenas os campos que faltam, em
                linguagem clara. Preenche o que sabe. O brief atualiza em tempo
                real para o Account — sem login, sem cadastro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA final */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-surface border-t border-bf-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text leading-[1.1] mb-6">
            Pronto para transformar{' '}
            <span className="italic text-accent">caos em estratégia</span>?
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
            Cole o primeiro input e veja a mágica acontecer. Sem cadastro, sem
            fricção.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-accent/20 group"
          >
            <span>Começar agora</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}
