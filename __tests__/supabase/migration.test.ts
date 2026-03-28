import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION_PATH = resolve(
  __dirname,
  "../../supabase/migrations/001_create_briefs.sql"
);

function readMigration(): string {
  return readFileSync(MIGRATION_PATH, "utf-8");
}

describe("Migration SQL — 001_create_briefs", () => {
  it("é válida e contém CREATE TABLE briefs", () => {
    const sql = readMigration();
    expect(sql).toBeTruthy();
    expect(sql).toContain("CREATE TABLE briefs");
  });

  it("inclui todos os campos obrigatórios", () => {
    const sql = readMigration();

    const requiredColumns = [
      "id",
      "anonymous_id",
      "raw_input",
      "structured_brief",
      "audit_results",
      "score",
      "field_scores",
      "title",
      "language",
      "status",
      "share_enabled",
      "client_inputs",
      "client_last_seen",
      "created_at",
      "updated_at",
    ];

    for (const column of requiredColumns) {
      expect(sql).toContain(column);
    }
  });

  it("inclui index idx_briefs_anonymous_id", () => {
    const sql = readMigration();
    expect(sql).toContain("idx_briefs_anonymous_id");
    expect(sql).toMatch(/CREATE INDEX.*idx_briefs_anonymous_id.*ON briefs/);
  });

  it("inclui index idx_briefs_share_enabled", () => {
    const sql = readMigration();
    expect(sql).toContain("idx_briefs_share_enabled");
    expect(sql).toMatch(/CREATE INDEX.*idx_briefs_share_enabled.*ON briefs/);
  });

  it("habilita RLS na tabela briefs", () => {
    const sql = readMigration();
    expect(sql).toMatch(
      /ALTER TABLE briefs ENABLE ROW LEVEL SECURITY/
    );
  });

  it("configura RLS policies para owner e shared briefs", () => {
    const sql = readMigration();
    // Owner policies
    expect(sql).toMatch(/CREATE POLICY.*ON briefs/);
    // Should have SELECT, INSERT, UPDATE policies
    expect(sql).toContain("SELECT");
    expect(sql).toContain("INSERT");
    expect(sql).toContain("UPDATE");
    // Should reference anonymous_id for owner checks
    expect(sql).toContain("anonymous_id");
    // Should reference share_enabled for public access
    expect(sql).toContain("share_enabled");
  });

  it("habilita Realtime na tabela briefs", () => {
    const sql = readMigration();
    expect(sql).toMatch(
      /ALTER PUBLICATION supabase_realtime ADD TABLE briefs/
    );
  });

  it("define tipos corretos para cada coluna", () => {
    const sql = readMigration();
    // UUID primary key
    expect(sql).toMatch(/id\s+UUID.*PRIMARY KEY/);
    // TEXT columns
    expect(sql).toMatch(/anonymous_id\s+TEXT\s+NOT NULL/);
    expect(sql).toMatch(/raw_input\s+TEXT\s+NOT NULL/);
    // JSONB columns
    expect(sql).toMatch(/structured_brief\s+JSONB/);
    expect(sql).toMatch(/audit_results\s+JSONB/);
    expect(sql).toMatch(/field_scores\s+JSONB/);
    expect(sql).toMatch(/client_inputs\s+JSONB/);
    // INTEGER
    expect(sql).toMatch(/score\s+INTEGER/);
    // BOOLEAN
    expect(sql).toMatch(/share_enabled\s+BOOLEAN/);
    // TIMESTAMPTZ
    expect(sql).toMatch(/client_last_seen\s+TIMESTAMPTZ/);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ/);
    expect(sql).toMatch(/updated_at\s+TIMESTAMPTZ/);
  });

  it("define defaults corretos", () => {
    const sql = readMigration();
    expect(sql).toContain("DEFAULT gen_random_uuid()");
    expect(sql).toMatch(/structured_brief\s+JSONB\s+NOT NULL\s+DEFAULT\s+'{}'/i);
    expect(sql).toMatch(/score\s+INTEGER\s+DEFAULT\s+0/);
    expect(sql).toMatch(/language\s+TEXT\s+DEFAULT\s+'pt-BR'/);
    expect(sql).toMatch(/status\s+TEXT\s+DEFAULT\s+'draft'/);
    expect(sql).toMatch(/share_enabled\s+BOOLEAN\s+DEFAULT\s+false/);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ\s+DEFAULT\s+NOW\(\)/);
    expect(sql).toMatch(/updated_at\s+TIMESTAMPTZ\s+DEFAULT\s+NOW\(\)/);
  });
});
