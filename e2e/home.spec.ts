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

// OpenFreeMap / OpenStreetMap は帰属表示が必須。DOM にあるだけでは足りず、
// 実際に画面内に見えている必要がある（過去に地図が 100vh + 44px になり画面外へ落ちた）
test("帰属表示がプレイヤーを開いても画面内に見えている", async ({ page }) => {
  await page.goto("/");

  const attribution = page.locator(".leaflet-control-attribution");
  await expect(attribution).toContainText("OpenFreeMap");

  const viewport = page.viewportSize();
  if (!viewport) throw new Error("viewport size が取れない");

  const inViewport = async () => {
    const box = await attribution.boundingBox();
    if (!box) throw new Error("帰属表示の座標が取れない");
    return box.y >= 0 && box.y + box.height <= viewport.height;
  };

  expect(await inViewport()).toBe(true);

  await page.locator(broadcastLabel(NTV)).click();
  const player = page.getByRole("dialog", { name: `${NTV} の動画プレイヤー` });
  await expect(player).toBeVisible();

  expect(await inViewport()).toBe(true);

  // プレイヤーに覆われていないこと
  const a = await attribution.boundingBox();
  const p = await player.boundingBox();
  if (!a || !p) throw new Error("座標が取れない");
  const overlaps = a.x < p.x + p.width && p.x < a.x + a.width && a.y < p.y + p.height && p.y < a.y + a.height;
  expect(overlaps).toBe(false);
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
