import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { init } from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';

init({
  dsn: import.meta.env.VITE_DESKTOP_SENTRY_DSN,
}, reactInit);

const root = createRoot(
  (document.getElementById('app') as Element),
);

(async () => {
  const isDebug = import.meta.env.VITE_IS_DEBUG == "TRUE";
  const systemAPI = await window.systemAPI;
  root.render(
    <App systemAPI={systemAPI} env={import.meta.env.VITE_BUILD_ENV_NORMALIZED ?? "development"}/>
  );
})();