/// <reference types="vite/client" />

import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import "@/globals.css";

/**
 * umami の website ID。CI がデプロイ時のビルドにだけ渡す。
 * 未設定なら計測タグごと出さないので、ローカルでは何も設定しない。
 */
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Japanese Local TV NEWS",
      },
      {
        name: "theme-color",
        content: "#08080c",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@300;400;500;600;700;800&display=swap",
      },
    ],
    scripts: UMAMI_WEBSITE_ID
      ? [
          {
            src: "https://cloud.umami.is/script.js",
            defer: true,
            "data-website-id": UMAMI_WEBSITE_ID,
          },
        ]
      : [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <TanStackDevtools />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body className="noise-overlay scan-line">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
