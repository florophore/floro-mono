import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import mixpanel from 'mixpanel-browser';

const root = createRoot(
  (document.getElementById('app') as Element),
);

(async () => {
  mixpanel.init('3ef6d7c0665cd33bcea1ecc3e034e8c3', {debug: true}); 
  const systemAPI = await window.systemAPI;
  root.render(
    <React.StrictMode>
      <App systemAPI={systemAPI} />
    </React.StrictMode>,
  );
})();