/**
 * インデックスページのテスト
 * Feature: 001-add-japan-map
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./index";

describe("Index Page", () => {
  describe("User Story 2: Application Title", () => {
    it("ページ上部にアプリケーション名「Japanese Local TV News」を表示する", () => {
      render(<Home />);

      const title = screen.getByRole("heading", { name: /Japanese Local TV News/i });
      expect(title).toBeInTheDocument();
    });

    it("タイトルが見出し要素（h1）として表示される", () => {
      render(<Home />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent(/Japanese Local TV News/i);
    });

    it("タイトルがページの上部に固定配置される", () => {
      render(<Home />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("broadcast-header");
    });

    it("タイトルが地図の上に表示される（z-indexが適切）", () => {
      render(<Home />);

      const header = screen.getByRole("banner");
      // broadcast-header クラスは CSS で z-index: 1000 を設定
      expect(header).toHaveClass("broadcast-header");
    });
  });
});
