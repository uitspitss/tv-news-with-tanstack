/**
 * インデックスページのテスト
 * Feature: 001-add-japan-map
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./index";

describe("Index Page", () => {
  describe("User Story 2: Application Title", () => {
    it("ページ上部にアプリケーション名「Japanese Local TV NEWS」を表示する", () => {
      render(<Home />);

      const title = screen.getByRole("heading", { name: /Japanese Local TV NEWS/i });
      expect(title).toBeInTheDocument();
    });

    it("タイトルが見出し要素（h1）として表示される", () => {
      render(<Home />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("Japanese Local TV NEWS");
    });

    it("タイトルがページの上部に固定配置される", () => {
      render(<Home />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("fixed", "top-0");
    });

    it("タイトルが地図の上に表示される（z-indexが適切）", () => {
      render(<Home />);

      const header = screen.getByRole("banner");
      // z-indexクラスが設定されていることを確認（Leafletより高い値）
      expect(header).toHaveClass("z-1000");
    });
  });
});
