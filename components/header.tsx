"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
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
          </nav>

          {/* Language placeholder */}
          <span className="text-xs font-mono text-text-muted px-2 py-1 rounded-full border border-bf-border hidden sm:inline-flex">
            PT
          </span>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu button - only on small screens */}
          <button
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-full text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Menu"
          >
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
          </button>
        </div>
      </div>
    </header>
  )
}
