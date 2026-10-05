import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SiteSettingsProvider>
    <App />
  </SiteSettingsProvider>
);
