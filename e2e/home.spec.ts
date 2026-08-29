import { broadcastLabel, expect, overlaps, test } from "./fixtures";

const NTV = "日本テレビ放送網";

test("トップページが配信され、地図と局名ラベルが表示される", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Japanese Local TV News" })).toBeVisible();
  // 地図は動的 import。ここが出れば SSR → hydration → クライアント読み込みまで通っている
  await expect(page.getByRole("application", { name: "日本地図" })).toBeVisible();
  // ラベルが出る = サーバーが配る /data/*.json を両方取得できている
  await expect(page.locator(broadcastLabel(NTV))).toBeVisible();
});

// 帰属表示は ODbL / OpenFreeMap 上の義務。DOM にあるだけでは足りず、
// 実際に画面内に見えている必要がある（過去に地図が 100vh + 44px になり画面外へ落ちた）。
// OpenStreetMap のクレジットが最も落としやすいのでこれを代表に取る
test("帰属表示がプレイヤーを開いても画面内に収まっている", async ({ page }) => {
  await page.goto("/");

  const credit = page.getByRole("link", { name: "OpenStreetMap" });
  await expect(credit).toBeInViewport({ ratio: 1 });

  await page.locator(broadcastLabel(NTV)).click();
  const player = page.getByRole("dialog", { name: `${NTV} の動画プレイヤー` });
  await expect(player).toBeVisible();

  await expect(credit).toBeInViewport({ ratio: 1 });
  // プレイヤーに覆われると見えているとは言えない
  expect(await overlaps(credit, player)).toBe(false);
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
