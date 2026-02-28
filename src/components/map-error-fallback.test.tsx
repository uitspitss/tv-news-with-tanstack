/**
 * MapErrorFallbackコンポーネントのテスト
 * Feature: 001-add-japan-map / User Story 1
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MapErrorFallback } from "./map-error-fallback";

describe("MapErrorFallback", () => {
  it("エラーメッセージを表示する", () => {
    const error = new Error("Failed to load map data");
    render(<MapErrorFallback error={error} />);
    expect(screen.getByText(/地図データの読み込みに失敗しました/i)).toBeInTheDocument();
  });

  it("再試行ボタンを表示する", () => {
    const error = new Error("Network error");
    const onRetry = vi.fn();
    render(<MapErrorFallback error={error} onRetry={onRetry} />);
    expect(screen.getByRole("button", { name: /再試行/i })).toBeInTheDocument();
  });

  it("再試行ボタンをクリックすると onRetry が呼ばれる", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const error = new Error("Test error");

    render(<MapErrorFallback error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /再試行/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Alertコンポーネントを使用している", () => {
    const error = new Error("Test error");
    const { container } = render(<MapErrorFallback error={error} />);

    // Alertコンポーネントには role="alert" が付与されている
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it("エラーの詳細を表示する（開発環境）", () => {
    const error = new Error("Detailed error message");
    render(<MapErrorFallback error={error} showDetails />);
    expect(screen.getByText(/detailed error message/i)).toBeInTheDocument();
  });

  it("エラーの詳細を非表示にする（本番環境）", () => {
    const error = new Error("Detailed error message");
    render(<MapErrorFallback error={error} showDetails={false} />);
    expect(screen.queryByText(/detailed error message/i)).not.toBeInTheDocument();
  });
});
