import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { FieldName, FieldStatus } from "@/lib/types"

vi.mock("@/styles/globals.css", () => ({}))

vi.mock("@/components/client-field", () => ({
  ClientField: ({ fieldName }: { fieldName: string }) => (
    <div data-testid={`client-field-${fieldName}`}>{fieldName}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeFields(
  overrides: Partial<
    Record<FieldName, { content: string; status: FieldStatus }>
  > = {}
) {
  const defaults: Record<FieldName, { content: string; status: FieldStatus }> =
    {
      context: { content: "ctx", status: "complete" },
      objective: { content: "obj", status: "complete" },
      audience: { content: "aud", status: "complete" },
      message: { content: "msg", status: "complete" },
      tone: { content: "tone", status: "complete" },
      deliverables: { content: "del", status: "complete" },
      budget: { content: "bud", status: "complete" },
      timeline: { content: "time", status: "complete" },
      kpis: { content: "kpi", status: "complete" },
      references: { content: "ref", status: "complete" },
    }
  return { ...defaults, ...overrides }
}

const noop = async () => {}

describe("BriefClientView", () => {
  it("renderiza apenas campos missing/partial", async () => {
    const { BriefClientView } = await import(
      "@/components/brief-client-view"
    )

    const fields = makeFields({
      budget: { content: "", status: "missing" },
      timeline: { content: "", status: "missing" },
      kpis: { content: "some", status: "partial" },
    })

    render(
      <BriefClientView
        title="Test Brief"
        fields={fields}
        clientInputs={{}}
        onFieldSave={noop}
      />
    )

    // Should render 3 ClientField instances (2 missing + 1 partial)
    expect(screen.getByTestId("client-field-budget")).toBeInTheDocument()
    expect(screen.getByTestId("client-field-timeline")).toBeInTheDocument()
    expect(screen.getByTestId("client-field-kpis")).toBeInTheDocument()

    // Should NOT render complete fields
    expect(
      screen.queryByTestId("client-field-context")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-objective")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-audience")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-message")
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId("client-field-tone")).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-deliverables")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-references")
    ).not.toBeInTheDocument()
  })

  it("não renderiza campos complete", async () => {
    const { BriefClientView } = await import(
      "@/components/brief-client-view"
    )

    // All 10 fields complete
    const fields = makeFields()

    render(
      <BriefClientView
        title="Test Brief"
        fields={fields}
        clientInputs={{}}
        onFieldSave={noop}
      />
    )

    // No ClientField instances should be rendered
    expect(
      screen.queryByTestId("client-field-context")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-objective")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-audience")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-message")
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId("client-field-tone")).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-deliverables")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-budget")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-timeline")
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId("client-field-kpis")).not.toBeInTheDocument()
    expect(
      screen.queryByTestId("client-field-references")
    ).not.toBeInTheDocument()
  })

  it("renderiza mensagem de boas-vindas", async () => {
    const { BriefClientView } = await import(
      "@/components/brief-client-view"
    )

    const fields = makeFields({
      budget: { content: "", status: "missing" },
    })

    render(
      <BriefClientView
        title="Test Brief"
        fields={fields}
        clientInputs={{}}
        onFieldSave={noop}
      />
    )

    // Welcome message should contain "agência" or "informações" or "Olá"
    expect(
      screen.getByText(/Olá|informações|agência/i)
    ).toBeInTheDocument()
  })

  it("renderiza progresso do preenchimento", async () => {
    const { BriefClientView } = await import(
      "@/components/brief-client-view"
    )

    const fields = makeFields({
      budget: { content: "", status: "missing" },
      timeline: { content: "", status: "missing" },
      kpis: { content: "", status: "missing" },
    })
    // 7 complete out of 10

    render(
      <BriefClientView
        title="Test Brief"
        fields={fields}
        clientInputs={{}}
        onFieldSave={noop}
      />
    )

    // Should show "7" and "10" somewhere in the progress indicator
    expect(screen.getByText(/7/)).toBeInTheDocument()
    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('renderiza estado "tudo preenchido"', async () => {
    const { BriefClientView } = await import(
      "@/components/brief-client-view"
    )

    // All 10 complete
    const fields = makeFields()

    render(
      <BriefClientView
        title="Test Brief"
        fields={fields}
        clientInputs={{}}
        onFieldSave={noop}
      />
    )

    // Thank you message
    expect(
      screen.getByText(/Obrigado|preenchidas|todas/i)
    ).toBeInTheDocument()
  })
})
