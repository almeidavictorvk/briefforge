import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock next/font/google fonts module
vi.mock("@/lib/fonts", () => ({
  instrumentSerif: { variable: "__font_display" },
  plusJakartaSans: { variable: "__font_body" },
  ibmPlexMono: { variable: "__font_mono" },
}));

// Mock CSS import
vi.mock("@/styles/globals.css", () => ({}));

// Mock Header component
vi.mock("@/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

import RootLayout from "@/app/layout";

describe("Root Layout", () => {
  // Task 15: Root layout renderiza children
  it("renders children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello BriefForge</div>
      </RootLayout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello BriefForge")).toBeInTheDocument();
  });

  // Task 16: Root layout aplica classe de fonte body
  it("applies body font class (font-body)", () => {
    render(
      <RootLayout>
        <p>test</p>
      </RootLayout>
    );
    // When RootLayout renders <html> and <body> inside jsdom, the browser
    // parser merges them into the document's own html/body elements.
    // So classes applied by RootLayout end up on document.body.
    const bodyEl = document.body;
    expect(bodyEl).not.toBeNull();
    expect(bodyEl.className).toContain("font-body");
  });

  // Task 17: Root layout aplica dark mode por padrão
  it("applies dark mode class by default", () => {
    render(
      <RootLayout>
        <p>test</p>
      </RootLayout>
    );
    // Similarly, the <html> element's classes end up on document.documentElement
    const htmlEl = document.documentElement;
    expect(htmlEl).not.toBeNull();
    expect(htmlEl.className).toContain("dark");
  });
});
