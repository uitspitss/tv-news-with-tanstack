import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { MapLoadingIndicator } from "@/components/map-loading-indicator";

const meta = {
  component: MapLoadingIndicator,
  tags: ["ai-generated"],
} satisfies Meta<typeof MapLoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * globals.css が preview に読み込まれているかの番人。
 * toBeVisible は素の HTML でも通るので、実測値で確かめる。
 * これが落ちたら他のストーリーの見た目は一切信用できない。
 */
export const CssCheck: Story = {
  play: async ({ canvasElement }) => {
    const pulse = canvasElement.querySelector(".loading-pulse");
    expect(pulse).not.toBeNull();

    // .loading-pulse の border-top-color は var(--broadcast-red) = #e8364f
    const style = getComputedStyle(pulse as Element);
    await expect(style.borderTopColor).toBe("rgb(232, 54, 79)");
    await expect(style.width).toBe("48px");
  },
};
