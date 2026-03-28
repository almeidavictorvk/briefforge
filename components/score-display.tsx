"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { getScoreColor, getScoreLabel } from "@/lib/scoring"

interface ScoreDisplayProps {
  score: number
  animate?: boolean
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  return <motion.span>{display}</motion.span>
}

export function ScoreDisplay({ score, animate = true }: ScoreDisplayProps) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  // Map color name to Tailwind text class
  const textColorClass =
    color === "success"
      ? "text-success"
      : color === "warning"
        ? "text-warning"
        : "text-error"

  // Map color name to SVG stroke color (CSS variable)
  const strokeColor =
    color === "success"
      ? "var(--color-success)"
      : color === "warning"
        ? "var(--color-warning)"
        : "var(--color-error)"

  // SVG circle dimensions
  const size = 120
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular indicator with SVG ring */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-bf-border opacity-30"
          />
          {/* Progress ring */}
          {animate ? (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          )}
        </svg>

        {/* Score number */}
        <span className={`font-mono text-3xl font-semibold ${textColorClass}`}>
          {animate ? <AnimatedNumber value={score} /> : score}
        </span>
      </div>

      {/* Label */}
      <span className={`text-sm font-medium ${textColorClass}`}>{label}</span>
    </div>
  )
}
