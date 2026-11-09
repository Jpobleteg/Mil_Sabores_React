import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AvisosProvider } from "./context/AvisosContext.jsx";
import App from "./App.jsx";
import "./styles/styles.css";
import "./styles/admin.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AvisosProvider>
        <App />
      </AvisosProvider>
    </BrowserRouter>
  </StrictMode>
);
