import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(
  (document.getElementById('app') as Element),
);

(async () => {
  const systemAPI = await window.systemAPI;
  root.render(
    <React.StrictMode>
      <App systemAPI={systemAPI} />
    </React.StrictMode>,
  );
})();