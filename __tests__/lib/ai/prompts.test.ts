import { describe, it, expect } from "vitest";
import { generateSystemPrompt, auditSystemPrompt } from "@/lib/ai/prompts";

describe("generateSystemPrompt", () => {
  it("retorna string não vazia", () => {
    const prompt = generateSystemPrompt("pt-BR");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("inclui idioma", () => {
    const prompt = generateSystemPrompt("en");
    // The prompt should contain a reference to responding in English
    expect(prompt.toLowerCase()).toMatch(/english/i);
  });

  it("inclui os 10 campos", () => {
    const prompt = generateSystemPrompt("pt-BR");
    const promptLower = prompt.toLowerCase();

    // All 10 field names (using their English key names since the schema uses them)
    const fields = [
      "context",
      "objective",
      "audience",
      "message",
      "tone",
      "deliverables",
      "budget",
      "timeline",
      "kpis",
      "references",
    ];

    for (const field of fields) {
      expect(promptLower).toContain(field);
    }
  });

  it("inclui regras de scoring", () => {
    const prompt = generateSystemPrompt("pt-BR");

    // Must mention all 4 scoring dimensions with their weights
    expect(prompt).toContain("40%");
    expect(prompt).toContain("30%");
    expect(prompt).toContain("20%");
    expect(prompt).toContain("10%");

    const promptLower = prompt.toLowerCase();
    // Must mention the scoring categories (in either PT or EN)
    expect(promptLower).toMatch(/completude|completeness/);
    expect(promptLower).toMatch(/clareza|clarity/);
    expect(promptLower).toMatch(/coer[eê]ncia|coherence/);
    expect(promptLower).toMatch(/mensurabilidade|measurability/);
  });

  it("inclui regra de não inventar", () => {
    const prompt = generateSystemPrompt("pt-BR");
    const promptLower = prompt.toLowerCase();

    // Must contain instruction to never invent/fabricate information
    expect(promptLower).toMatch(/never invent|nunca invent|never fabricat|não invent|do not invent|não fabricar|never hallucinate/);
  });
});

describe("auditSystemPrompt", () => {
  it("retorna string não vazia", () => {
    const prompt = auditSystemPrompt("pt-BR");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("instrui re-avaliação", () => {
    const prompt = auditSystemPrompt("pt-BR");
    const promptLower = prompt.toLowerCase();

    // Must mention re-evaluation / re-audit / re-assess
    expect(promptLower).toMatch(/re-evaluat|re-audit|re-assess|reavaliar|re-avaliar|reavali/);
  });
});
