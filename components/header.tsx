"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/80 border-b border-bf-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-text hover:text-accent transition-colors duration-300"
        >
          BriefForge
        </Link>

        {/* Nav + Toggles */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Nav links - hidden on very small screens */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/history"
              className="text-sm text-text-secondary hover:text-text transition-colors duration-300 px-3 py-1.5 rounded-full hover:bg-surface-hover"
            >
              Histórico
            </Link>
            <Link
              href="/sobre"
              className="text-sm text-text-secondary hover:text-text transition-colors duration-300 px-3 py-1.5 rounded-full hover:bg-surface-hover"
            >
              Sobre
            </Link>
          </nav>

          {/* Language placeholder */}
          <span className="text-xs font-mono text-text-muted px-2 py-1 rounded-full border border-bf-border hidden sm:inline-flex">
            PT
          </span>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu button - only on small screens */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-full text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
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
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
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
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <nav className="sm:hidden border-t border-bf-border bg-bg/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1">
            <Link
              href="/history"
              onClick={() => setMobileOpen(false)}
              className={`text-sm px-3 py-2.5 rounded-xl transition-colors duration-300 ${
                pathname === "/history"
                  ? "text-text bg-surface-hover"
                  : "text-text-secondary hover:text-text hover:bg-surface-hover"
              }`}
            >
              Histórico
            </Link>
            <Link
              href="/sobre"
              onClick={() => setMobileOpen(false)}
              className={`text-sm px-3 py-2.5 rounded-xl transition-colors duration-300 ${
                pathname === "/sobre"
                  ? "text-text bg-surface-hover"
                  : "text-text-secondary hover:text-text hover:bg-surface-hover"
              }`}
            >
              Sobre
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
