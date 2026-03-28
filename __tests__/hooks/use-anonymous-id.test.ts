import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnonymousId } from "@/hooks/use-anonymous-id";

describe("useAnonymousId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("gera ID no primeiro uso", async () => {
    const { result } = renderHook(() => useAnonymousId());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.anonymousId).toBeTruthy();
    expect(typeof result.current.anonymousId).toBe("string");
    expect(result.current.anonymousId.length).toBeGreaterThan(0);
  });

  it("persiste no localStorage", async () => {
    const { result } = renderHook(() => useAnonymousId());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    const stored = localStorage.getItem("briefforge-anonymous-id");
    expect(stored).not.toBeNull();
    expect(stored).toBe(result.current.anonymousId);
  });

  it("reutiliza ID existente", async () => {
    const existingId = "existing-test-id-12345";
    localStorage.setItem("briefforge-anonymous-id", existingId);

    const { result } = renderHook(() => useAnonymousId());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.anonymousId).toBe(existingId);
  });

  it("retorna isReady=true quando ID disponível", async () => {
    const { result } = renderHook(() => useAnonymousId());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.anonymousId).toBeTruthy();
  });
});
