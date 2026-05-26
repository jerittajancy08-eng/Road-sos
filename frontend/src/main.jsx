import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./hooks/useAuth";
import { EmergencyProvider } from "./hooks/EmergencyContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmergencyProvider>
          <App />
        </EmergencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
