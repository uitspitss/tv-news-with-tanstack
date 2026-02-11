/// <reference types="vite/client" />

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./globals.css";

const App = (
  <StrictMode>
    <StartClient />
  </StrictMode>
);

hydrateRoot(document, App);
