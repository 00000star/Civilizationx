import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { CodexModeProvider } from "./context/CodexModeContext";

void import("virtual:pwa-register")
  .then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent("codex-pwa-need-refresh"));
      },
    });
  })
  .catch(() => {
    /* dev without plugin */
  });

const routerBasename =
  import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <CodexModeProvider>
        <App />
      </CodexModeProvider>
    </BrowserRouter>
  </StrictMode>
);
