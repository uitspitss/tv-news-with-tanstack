/// <reference types="vite/client" />

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./globals.css";

const App = (
  <>
    {import.meta.env.DEV && <div>Development Mode</div>}
    <StartClient />
  </>
);

hydrateRoot(document, import.meta.env.DEV ? <StrictMode>{App}</StrictMode> : App);
