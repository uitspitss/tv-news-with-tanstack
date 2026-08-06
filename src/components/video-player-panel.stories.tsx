import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, mocked } from "storybook/test";
import { VideoPlayerPanel } from "@/components/video-player-panel";
// .storybook/mock-modules.ts でモックに差し替えられている
import { useVideoPlayer } from "@/contexts/video-player-context";
import type { Broadcast } from "@/types/broadcast";

const BROADCAST: Broadcast = {
  id: "hokkaido-htb",
  prefecture: "北海道",
  broadcastName: "HTB北海道ニュース",
  channelURL: "https://www.youtube.com/@htb_news",
  playlistId: "PLxxxxxxxxxxxxxxxxxxxx",
};

const closePlayer = fn().mockName("closePlayer");

function mockPlayerState(selectedBroadcast: Broadcast | null, selectedIndex?: number) {
  mocked(useVideoPlayer).mockReturnValue({
    selectedBroadcast,
    selectedIndex,
    openPlayer: fn().mockName("openPlayer"),
    closePlayer,
    updateIndex: fn().mockName("updateIndex"),
  });
}

const meta = {
  component: VideoPlayerPanel,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VideoPlayerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  async beforeEach() {
    closePlayer.mockClear();
    mockPlayerState(BROADCAST, 0);
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("dialog", { name: "HTB北海道ニュース の動画プレイヤー" }),
    ).toBeVisible();
    await expect(canvas.getByText("HTB北海道ニュース")).toBeVisible();
  },
};

/** 閉じるボタンとチャンネルリンクは drag-handle の中にあるが、操作は伝播しない */
export const CloseButton: Story = {
  async beforeEach() {
    closePlayer.mockClear();
    mockPlayerState(BROADCAST, 0);
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "動画プレイヤーを閉じる" }));
    await expect(closePlayer).toHaveBeenCalledTimes(1);
  },
};

/** Esc でも閉じる */
export const EscapeClosesPlayer: Story = {
  async beforeEach() {
    closePlayer.mockClear();
    mockPlayerState(BROADCAST, 0);
  },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Escape}");
    await expect(closePlayer).toHaveBeenCalledTimes(1);
  },
};

/** 選択中の放送局が無ければ何も描画しない */
export const Closed: Story = {
  async beforeEach() {
    closePlayer.mockClear();
    mockPlayerState(null);
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("dialog")).toBeNull();
  },
};
