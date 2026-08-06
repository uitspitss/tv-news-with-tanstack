import type { Preview } from "@storybook/react-vite";
import "../src/globals.css";

// アプリ本体は body に付けている（src/routes/__root.tsx）。
// preview の iframe には伝わらないのでここで付ける。
document.body.classList.add("noise-overlay", "scan-line");

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },

    // 'todo' - a11y 違反はテスト UI にのみ出す
    // 'error' - 違反で CI を落とす
    // 'off'   - a11y チェックをしない
    a11y: { test: "todo" },
  },

  decorators: [
    (Story) => (
      <div className="min-h-svh bg-background p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
