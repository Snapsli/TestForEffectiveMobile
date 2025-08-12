import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { AuthBootstrap, AuthProvider } from "./auth/AuthProvider";

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthBootstrap />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

