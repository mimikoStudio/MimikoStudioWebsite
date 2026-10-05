import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <SiteSettingsProvider>
      <App />
    </SiteSettingsProvider>
  </ErrorBoundary>
);
