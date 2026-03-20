/**
 * MapLoadingIndicatorコンポーネントのテスト
 * Feature: 001-add-japan-map / User Story 1
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapLoadingIndicator } from "./map-loading-indicator";

describe("MapLoadingIndicator", () => {
  it("ローディングメッセージを表示する", () => {
    render(<MapLoadingIndicator />);
    expect(screen.getByText(/loading map/i)).toBeInTheDocument();
  });

  it("ローディングパルスアニメーションを表示する", () => {
    const { container } = render(<MapLoadingIndicator />);
    const pulse = container.querySelector(".loading-pulse");
    expect(pulse).toBeInTheDocument();
  });

  it("ローディング状態を視覚的に示す要素がある", () => {
    const { container } = render(<MapLoadingIndicator />);
    const loadingContainer = container.querySelector('[role="status"]');
    expect(loadingContainer).toBeInTheDocument();
  });

  it("適切なARIA属性が設定されている", () => {
    const { container } = render(<MapLoadingIndicator />);
    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toHaveAttribute("aria-live", "polite");
  });
});
