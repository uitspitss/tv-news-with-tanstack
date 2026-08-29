// Cloudflare Workers環境の型定義
interface Env {
  ENVIRONMENT?: "development" | "preview" | "production";
}

// TanStack Start型拡張
declare module "@tanstack/react-start" {
  interface Register {
    router: ReturnType<typeof import("./src/router").getRouter>;
  }
}
