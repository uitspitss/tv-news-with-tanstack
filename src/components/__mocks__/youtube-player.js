import { createElement } from "react";

/**
 * 本物は https://www.youtube.com/iframe_api を document.head に差し込む。
 * ストーリーからネットワークを触らせないための差し替え。
 * 元モジュールの export を増やしたらここにも足すこと。
 */
export function YouTubePlayer({ playlistId, index }) {
  return createElement(
    "div",
    {
      "data-testid": "youtube-player-mock",
      className: "flex h-full w-full items-center justify-center bg-black text-xs",
      // --muted-foreground だと黒背景でコントラスト 4.3:1 になり、
      // モックのせいで a11y 違反が出てしまう
      style: { color: "var(--foreground)" },
    },
    `YouTube playlist ${playlistId}${index == null ? "" : ` #${index}`}`,
  );
}
