import React from "react"
import { createRoot } from 'react-dom/client';
import App from "./App"
import "./index.css"

const root = createRoot(
  (document.getElementById("app") as Element)
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);