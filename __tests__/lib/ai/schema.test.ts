import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { fieldSchema, briefSchema } from "@/lib/ai/schema";

// Helper: returns a complete valid brief object for reuse across tests
function makeValidBrief() {
  return {
    title: "Campaign Brief Q1 2026",
    fields: {
      context: { content: "Company launching new product line in Brazil", status: "complete" as const },
      objective: { content: "Increase brand awareness by 30% in 6 months", status: "complete" as const },
      audience: { content: "Young adults 18-35, urban, digital-native", status: "complete" as const },
      message: { content: "Innovation meets sustainability", status: "complete" as const },
      tone: { content: "Modern, approachable, confident", status: "complete" as const },
      deliverables: { content: "3 videos, 10 social posts, 1 landing page", status: "complete" as const },
      budget: { content: "R$ 150.000", status: "partial" as const, suggestion: "Specify breakdown per deliverable" },
      timeline: { content: "March to August 2026", status: "complete" as const },
      kpis: { content: "Reach 1M impressions, 50K engagements, 10K site visits", status: "complete" as const },
      references: { content: "Nike 'Just Do It' campaign, Natura branding", status: "complete" as const },
    },
    audit: {
      gaps: [
        { field: "budget", severity: "warning" as const, suggestion: "Budget lacks detailed breakdown per deliverable" },
      ],
      contradictions: [
        { description: "Timeline is tight for the number of deliverables", fields: ["deliverables", "timeline"] },
      ],
      overall_note: "Brief is well-structured with minor gaps in budget detail.",
    },
    score: 82,
  };
}

describe("fieldSchema", () => {
  it("valida campo completo", () => {
    const data = { content: "texto", status: "complete" };
    const result = fieldSchema.parse(data);
    expect(result.content).toBe("texto");
    expect(result.status).toBe("complete");
  });

  it("valida campo com suggestion", () => {
    const data = { content: "", status: "missing", suggestion: "Pergunte X" };
    const result = fieldSchema.parse(data);
    expect(result.content).toBe("");
    expect(result.status).toBe("missing");
    expect(result.suggestion).toBe("Pergunte X");
  });

  it("rejeita status inválido", () => {
    const data = { content: "", status: "invalid" };
    expect(() => fieldSchema.parse(data)).toThrow(ZodError);
  });

  it("rejeita sem content", () => {
    const data = { status: "complete" };
    expect(() => fieldSchema.parse(data)).toThrow(ZodError);
  });
});

describe("briefSchema", () => {
  it("valida brief completo", () => {
    const brief = makeValidBrief();
    const result = briefSchema.parse(brief);
    expect(result.title).toBe("Campaign Brief Q1 2026");
    expect(result.score).toBe(82);
    expect(result.fields.context.status).toBe("complete");
    expect(result.fields.budget.suggestion).toBe("Specify breakdown per deliverable");
    expect(result.audit.gaps).toHaveLength(1);
    expect(result.audit.contradictions).toHaveLength(1);
    expect(result.audit.overall_note).toBeTruthy();
  });

  it("rejeita score fora do range", () => {
    const brief = makeValidBrief();
    brief.score = 150;
    expect(() => briefSchema.parse(brief)).toThrow(ZodError);
  });

  it("rejeita score negativo", () => {
    const brief = makeValidBrief();
    brief.score = -10;
    expect(() => briefSchema.parse(brief)).toThrow(ZodError);
  });

  it("rejeita campo faltando", () => {
    const brief = makeValidBrief();
    // Remove the budget field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { budget: _budget, ...fieldsWithoutBudget } = brief.fields;
    const briefWithoutBudget = { ...brief, fields: fieldsWithoutBudget };
    expect(() => briefSchema.parse(briefWithoutBudget)).toThrow(ZodError);
  });

  it("valida audit com gaps", () => {
    const brief = makeValidBrief();
    brief.audit.gaps = [
      { field: "budget", severity: "critical" as const, suggestion: "Budget is completely missing" },
      { field: "kpis", severity: "warning" as const, suggestion: "KPIs could be more specific" },
    ];
    const result = briefSchema.parse(brief);
    expect(result.audit.gaps).toHaveLength(2);
    expect(result.audit.gaps[0].severity).toBe("critical");
    expect(result.audit.gaps[1].severity).toBe("warning");
  });

  it("valida audit com contradictions", () => {
    const brief = makeValidBrief();
    brief.audit.contradictions = [
      { description: "Timeline is tight for the number of deliverables", fields: ["deliverables", "timeline"] },
      { description: "Budget does not match deliverable scope", fields: ["budget", "deliverables"] },
    ];
    const result = briefSchema.parse(brief);
    expect(result.audit.contradictions).toHaveLength(2);
    expect(result.audit.contradictions[0].fields).toContain("deliverables");
    expect(result.audit.contradictions[1].fields).toContain("budget");
  });

  it("rejeita severity inválida", () => {
    const brief = makeValidBrief();
    brief.audit.gaps = [
      // @ts-expect-error — intentionally passing invalid severity to test runtime validation
      { field: "budget", severity: "info", suggestion: "Some suggestion" },
    ];
    expect(() => briefSchema.parse(brief)).toThrow(ZodError);
  });
});
