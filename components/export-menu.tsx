"use client"

import { Download, FileText, Copy } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { generateBriefPDF } from "@/lib/pdf"
import { generateBriefMarkdown } from "@/lib/markdown"
import type { Brief } from "@/lib/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExportMenuProps {
  brief: Brief
  onExportPDF?: () => void
  onExportMarkdown?: () => void
}

// ---------------------------------------------------------------------------
// Clipboard helper with fallback
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers / insecure context
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.left = "-9999px"
    textarea.style.top = "-9999px"
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    document.body.removeChild(textarea)
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportMenu({ brief, onExportPDF, onExportMarkdown }: ExportMenuProps) {
  const handlePDF = async () => {
    if (onExportPDF) {
      onExportPDF()
      return
    }

    try {
      const blob = await generateBriefPDF(brief)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${brief.title || "brief"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Erro ao gerar PDF")
    }
  }

  const handleMarkdown = async () => {
    if (onExportMarkdown) {
      onExportMarkdown()
    }

    try {
      const markdown = generateBriefMarkdown(brief)
      await copyToClipboard(markdown)
      toast.success("Copiado!")
    } catch {
      toast.error("Erro ao copiar")
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-bf-border bg-surface px-4 py-2 text-sm font-medium text-text transition-all duration-300 hover:scale-105 hover:bg-surface-hover active:scale-95"
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onSelect={handlePDF} className="cursor-pointer gap-2">
          <FileText className="h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleMarkdown} className="cursor-pointer gap-2">
          <Copy className="h-4 w-4" />
          Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
