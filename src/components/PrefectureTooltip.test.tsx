import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrefectureTooltip } from "./PrefectureTooltip";

describe("PrefectureTooltip", () => {
  it("should render prefecture name when provided", () => {
    render(
      <PrefectureTooltip prefectureName="東京都" isVisible={true}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    expect(screen.getByText("東京都")).toBeInTheDocument();
  });

  it("should not render tooltip when isVisible is false", () => {
    const { container } = render(
      <PrefectureTooltip prefectureName="東京都" isVisible={false}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    // Tooltip content should not be visible
    expect(screen.queryByText("東京都")).not.toBeInTheDocument();
  });

  it("should render children element", () => {
    render(
      <PrefectureTooltip prefectureName="東京都" isVisible={true}>
        <div data-testid="map-element">Map Element</div>
      </PrefectureTooltip>,
    );

    expect(screen.getByTestId("map-element")).toBeInTheDocument();
    expect(screen.getByText("Map Element")).toBeInTheDocument();
  });

  it("should not render tooltip when prefectureName is null", () => {
    render(
      <PrefectureTooltip prefectureName={null} isVisible={true}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    // Only children should be rendered
    expect(screen.getByText("Map Element")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("should handle empty prefecture name", () => {
    render(
      <PrefectureTooltip prefectureName="" isVisible={true}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    // Empty string should not render tooltip content
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("should display various prefecture names correctly", () => {
    const prefectures = ["北海道", "青森県", "東京都", "大阪府", "沖縄県"];

    prefectures.forEach((prefecture) => {
      const { rerender, unmount } = render(
        <PrefectureTooltip prefectureName={prefecture} isVisible={true}>
          <div>Map Element</div>
        </PrefectureTooltip>,
      );

      expect(screen.getByText(prefecture)).toBeInTheDocument();

      unmount();
    });
  });

  it("should have proper accessibility attributes", () => {
    const { container } = render(
      <PrefectureTooltip prefectureName="東京都" isVisible={true}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    // Check for aria-label or role="tooltip"
    const tooltipElements = container.querySelectorAll('[role="tooltip"], [aria-label]');
    expect(tooltipElements.length).toBeGreaterThan(0);
  });

  it("should support positioning props", () => {
    render(
      <PrefectureTooltip prefectureName="東京都" isVisible={true} position={{ x: 100, y: 200 }}>
        <div>Map Element</div>
      </PrefectureTooltip>,
    );

    expect(screen.getByText("東京都")).toBeInTheDocument();
  });
});
