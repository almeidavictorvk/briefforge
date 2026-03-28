import { z } from 'zod'

export const fieldSchema = z.object({
  content: z.string(),
  status: z.enum(['complete', 'partial', 'missing']),
  suggestion: z.string().optional(),
})

export const briefSchema = z.object({
  title: z.string(),
  fields: z.object({
    context: fieldSchema,
    objective: fieldSchema,
    audience: fieldSchema,
    message: fieldSchema,
    tone: fieldSchema,
    deliverables: fieldSchema,
    budget: fieldSchema,
    timeline: fieldSchema,
    kpis: fieldSchema,
    references: fieldSchema,
  }),
  audit: z.object({
    gaps: z.array(
      z.object({
        field: z.string(),
        severity: z.enum(['critical', 'warning']),
        suggestion: z.string(),
      })
    ),
    contradictions: z.array(
      z.object({
        description: z.string(),
        fields: z.array(z.string()),
      })
    ),
    overall_note: z.string(),
  }),
  score: z.number().int().min(0).max(100),
})

export type Field = z.infer<typeof fieldSchema>
export type Brief = z.infer<typeof briefSchema>
