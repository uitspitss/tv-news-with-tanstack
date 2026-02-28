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
    expect(screen.getByText(/地図を読み込んでいます/i)).toBeInTheDocument();
  });

  it("Skeletonコンポーネントを表示する", () => {
    const { container } = render(<MapLoadingIndicator />);
    // Skeletonコンポーネントには特定のクラスが付与されている
    const skeleton = container.querySelector('[data-testid="map-skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("ローディング状態を視覚的に示す要素がある", () => {
    const { container } = render(<MapLoadingIndicator />);
    // ローディングインジケーターのコンテナ
    const loadingContainer = container.querySelector('[role="status"]');
    expect(loadingContainer).toBeInTheDocument();
  });

  it("適切なARIA属性が設定されている", () => {
    const { container } = render(<MapLoadingIndicator />);
    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toHaveAttribute("aria-live", "polite");
  });
});
