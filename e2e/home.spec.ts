import { broadcastLabel, expect, test } from "./fixtures";

const NTV = "日本テレビ放送網";

test("トップページが配信され、地図と局名ラベルが表示される", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Japanese Local TV News" })).toBeVisible();
  // 地図は動的 import。ここが出れば SSR → hydration → クライアント読み込みまで通っている
  await expect(page.getByRole("application", { name: "日本地図" })).toBeVisible();
  // ラベルが出る = サーバーが配る /data/*.json を両方取得できている
  await expect(page.locator(broadcastLabel(NTV))).toBeVisible();
});

test("局名をクリックするとプレイヤーが開き、URL に反映される", async ({ page }) => {
  await page.goto("/");
  await page.locator(broadcastLabel(NTV)).click();

  await expect(page.getByRole("dialog", { name: `${NTV} の動画プレイヤー` })).toBeVisible();
  await expect(page).toHaveURL(/\?broadcast=ntv/);
});

test("broadcast クエリ付きで直接開くとプレイヤーが復元される", async ({ page }) => {
  await page.goto("/?broadcast=ntv");

  await expect(page.getByRole("dialog", { name: `${NTV} の動画プレイヤー` })).toBeVisible();
});

test("閉じるボタンでプレイヤーが閉じ、URL から broadcast が消える", async ({ page }) => {
  await page.goto("/?broadcast=ntv");

  const player = page.getByRole("dialog", { name: `${NTV} の動画プレイヤー` });
  await expect(player).toBeVisible();

  await page.getByRole("button", { name: "動画プレイヤーを閉じる" }).click();

  await expect(player).toBeHidden();
  await expect(page).not.toHaveURL(/broadcast=/);
});
