import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./renderer/src/context/AuthContext.tsx";
import { DarkModeProvider } from "./renderer/src/context/DarkMode.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AuthProvider>
        <MantineProvider>
          <App />
        </MantineProvider>
      </AuthProvider>
    </DarkModeProvider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
