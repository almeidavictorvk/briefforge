"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { FieldName, FieldStatus } from "@/lib/types"

// ---------------------------------------------------------------------------
// Simplified language mapping (PT-BR) — no agency jargon
// ---------------------------------------------------------------------------

const SIMPLIFIED_LABELS: Record<FieldName, string> = {
  context:
    "Conte um pouco sobre o cenário atual da sua empresa e o que motivou esse projeto.",
  objective:
    "O que você quer alcançar com esse projeto? Qual seria o resultado ideal?",
  audience:
    "Quem você quer atingir? Pense na pessoa que compraria seu produto.",
  message:
    "Qual é a ideia principal que você quer comunicar? O que as pessoas devem lembrar?",
  tone: "Como você quer que a comunicação soe? Mais formal, descontraída, inspiradora?",
  deliverables:
    "O que precisa ser entregue? (Ex: site, vídeo, campanha, posts...)",
  budget:
    "Quanto sua empresa pode investir neste projeto? Mesmo um range aproximado nos ajuda.",
  timeline:
    "Tem algum prazo ou data importante? (Ex: lançamento, evento, sazonalidade)",
  kpis: "Como medir o sucesso? O que significaria 'deu certo' pra você?",
  references:
    "Tem exemplos ou referências que te inspiram? Pode ser de concorrentes, outras marcas, etc.",
}

const GUIDED_PLACEHOLDERS: Record<FieldName, string> = {
  context: "Ex: Somos uma startup de saúde e estamos lançando um novo app...",
  objective: "Ex: Queremos aumentar as vendas em 30% no próximo trimestre...",
  audience: "Ex: Mulheres de 25-40 anos, classe B, que se preocupam com saúde...",
  message: "Ex: Nosso produto é a solução mais acessível e confiável do mercado...",
  tone: "Ex: Descontraída mas profissional, como uma conversa com um amigo que entende do assunto...",
  deliverables: "Ex: 1 vídeo institucional, 10 posts para Instagram, 1 landing page...",
  budget: "Ex: Entre R$ 30.000 e R$ 50.000, mas podemos negociar...",
  timeline: "Ex: Precisamos ter tudo pronto até 15 de março para o lançamento...",
  kpis: "Ex: Aumento de 20% em leads qualificados, 50 mil views no vídeo...",
  references: "Ex: Gosto muito do estilo da marca X, e a campanha Y do concorrente...",
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ClientFieldProps {
  fieldName: FieldName
  field: {
    content: string
    status: FieldStatus
    suggestion?: string
  }
  clientInput?: string
  onSave: (fieldName: string, content: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientField({ fieldName, field, clientInput, onSave }: ClientFieldProps) {
  const [value, setValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // If client already submitted input, show as complete
  const hasClientInput = Boolean(clientInput)
  const isComplete = field.status === "complete" || hasClientInput
  const isPartial = !isComplete && field.status === "partial"
  const simplifiedLabel = SIMPLIFIED_LABELS[fieldName]
  const placeholder = GUIDED_PLACEHOLDERS[fieldName]

  const handleSave = async () => {
    if (!value.trim()) return
    setIsSaving(true)
    try {
      await onSave(fieldName, value)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-3xl border border-bf-border bg-surface p-6 transition-all duration-300">
      {/* Simplified label */}
      <p className="mb-4 text-base font-medium leading-relaxed text-text">
        {simplifiedLabel}
      </p>

      {/* Complete: readonly content */}
      {isComplete && (
        <div className="rounded-2xl bg-success/10 p-4">
          <p className="whitespace-pre-wrap text-sm text-text">
            {hasClientInput ? clientInput : field.content}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
            <Check className="h-3.5 w-3.5" />
            Preenchido
          </div>
        </div>
      )}

      {/* Partial: show existing content as context + textarea to complement */}
      {isPartial && (
        <>
          <div className="mb-4 rounded-2xl bg-warning/10 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-text-muted">
              Informação atual
            </p>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">
              {field.content}
            </p>
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-none rounded-2xl border border-bf-border bg-surface-hover p-4 text-sm text-text outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent"
            rows={4}
          />
        </>
      )}

      {/* Missing: textarea with guided placeholder */}
      {!isComplete && !isPartial && (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-bf-border bg-surface-hover p-4 text-sm text-text outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent"
          rows={4}
        />
      )}

      {/* Save button — only when field is editable (not complete) */}
      {!isComplete && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Salvar"
            onClick={handleSave}
            disabled={isSaving || !value.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  data-testid="client-field-loading"
                />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Salvar
              </>
            )}
          </button>

          {/* Success feedback */}
          {showSuccess && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="h-4 w-4" />
              Salvo com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
