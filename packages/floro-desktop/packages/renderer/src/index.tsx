import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import mixpanel from 'mixpanel-browser';

const root = createRoot(
  (document.getElementById('app') as Element),
);

(async () => {
  const isDebug = import.meta.env.VITE_IS_DEBUG == "TRUE";
  mixpanel.init(import.meta.env.VITE_MIX_PANEL_KEY, {debug: isDebug});
  const systemAPI = await window.systemAPI;
  root.render(
    <App systemAPI={systemAPI} env={import.meta.env.VITE_BUILD_ENV_NORMALIZED ?? "development"}/>
  );
})();