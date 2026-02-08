// Cloudflare Workers環境の型定義
interface Env {
  // Required for Basic Auth
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASSWORD: string;

  // Optional metadata
  ENVIRONMENT?: "development" | "preview" | "production";
  APP_NAME?: string;
  VERSION?: string;

  // Future Cloudflare Bindings (例)
  // MY_KV_NAMESPACE?: KVNamespace
  // MY_D1_DB?: D1Database
  // MY_R2_BUCKET?: R2Bucket
}

// TanStack Start型拡張
declare module "@tanstack/react-start" {
  interface Register {
    router: ReturnType<typeof import("./app/router").getRouter>;
  }
}
