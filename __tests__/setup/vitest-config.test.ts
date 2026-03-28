import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

// Task 13: Vitest está configurado e roda
describe("Vitest Configuration", () => {
  it("vitest is configured and runs", () => {
    expect(true).toBe(true);
  });
});

// Task 14: Path aliases funcionam
describe("Path Aliases", () => {
  it("resolves @/lib/utils import", () => {
    expect(cn).toBeDefined();
    expect(typeof cn).toBe("function");
  });

  it("cn utility works correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
});
