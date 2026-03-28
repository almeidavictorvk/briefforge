import { describe, it, expect } from "vitest";
import { FIELD_NAMES, type Brief } from "@/lib/types";
import { briefSchema } from "@/lib/ai/schema";
import { z } from "zod";

describe("FIELD_NAMES", () => {
  it("contém exatamente 10 campos", () => {
    expect(FIELD_NAMES.length).toBe(10);
  });

  it("contém todos os campos esperados", () => {
    const expectedFields = [
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

    for (const field of expectedFields) {
      expect(FIELD_NAMES).toContain(field);
    }
  });
});

describe("Brief type compatibility", () => {
  it("z.infer<typeof briefSchema> é compatível com Brief type", () => {
    // If this compiles, the types are compatible
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const assertType = <T>(_value: T) => {};
    // The Brief type should be assignable from the schema inferred type
    type SchemaType = z.infer<typeof briefSchema>;
    // Create a dummy to verify types align
    const schemaObj = {} as SchemaType;
    assertType<Brief>(schemaObj);
    expect(true).toBe(true); // compile-time check
  });
});
