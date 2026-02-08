import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>TV News with TanStack へようこそ</h1>
      <p>開発環境のセットアップが完了しました！</p>
      <h2>次のステップ:</h2>
      <ul>
        <li>
          <code>bun run type-check</code> - TypeScript型チェック
        </li>
        <li>
          <code>bun run check</code> - リント・フォーマット
        </li>
        <li>
          <code>bun run test</code> - テスト実行
        </li>
      </ul>
    </main>
  );
}
