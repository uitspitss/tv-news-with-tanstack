import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { MapErrorFallback } from "@/components/map-error-fallback";

const meta = {
  component: MapErrorFallback,
  tags: ["ai-generated"],
  args: {
    error: new Error("Failed to fetch prefecture-offices.json (500)"),
    // 既定は import.meta.env.DEV 依存なので、ストーリーでは必ず明示する
    showDetails: false,
  },
} satisfies Meta<typeof MapErrorFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

/** onRetry を渡さない場合、再試行ボタンは出ない */
export const WithoutRetry: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: "再試行" })).toBeNull();
  },
};

export const WithRetry: Story = {
  args: { onRetry: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};

/** 開発時のみ出るエラー詳細。閉じている間は message が読めない */
export const WithDetails: Story = {
  args: { showDetails: true, onRetry: fn() },
  play: async ({ canvas, userEvent }) => {
    const summary = canvas.getByText("エラーの詳細");
    await expect(canvas.queryByText(/500/)).not.toBeVisible();

    await userEvent.click(summary);
    await expect(canvas.getByText(/500/)).toBeVisible();
  },
};
