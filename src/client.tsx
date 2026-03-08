/// <reference types="vite/client" />

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

if (import.meta.env.DEV) {
  import("react-scan").then(({ scan }) => {
    scan({ enabled: true });
  });
}

const App = (
  <StrictMode>
    <StartClient />
  </StrictMode>
);

hydrateRoot(document, App);
