import { fn } from "storybook/test";

/**
 * 本物は TanStack Router の useSearch({ from: "/" }) に依存していて、
 * ストーリー単体では動かせない。ストーリー側から
 * mocked(useVideoPlayer).mockReturnValue(...) で状態を作る。
 * 元モジュールの export を増やしたらここにも足すこと。
 */
export const useVideoPlayer = fn(() => ({
  selectedBroadcast: null,
  selectedIndex: undefined,
  openPlayer: fn().mockName("openPlayer"),
  closePlayer: fn().mockName("closePlayer"),
  updateIndex: fn().mockName("updateIndex"),
})).mockName("useVideoPlayer");

export function VideoPlayerProvider({ children }) {
  return children;
}
