"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  briefId?: string
  isShared?: boolean
  onShare: () => Promise<void>
}

export function ShareButton({ briefId, isShared, onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const isDisabled = !briefId || loading

  const handleShare = async () => {
    if (!briefId) return

    setLoading(true)
    try {
      await onShare()

      const shareLink = `${window.location.origin}/share/${briefId}`
      await navigator.clipboard.writeText(shareLink)

      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Error handling — could add toast here
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 rounded-full px-5 py-2.5
        text-sm font-medium transition-all duration-300
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${
          copied
            ? "bg-success/10 text-success border border-success/30"
            : isShared
              ? "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
              : "bg-accent text-white hover:bg-accent/90"
        }
      `}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Link copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>
            {isShared ? "Copiar link" : "Compartilhar com Cliente"}
          </span>
        </>
      )}
    </button>
  )
}
