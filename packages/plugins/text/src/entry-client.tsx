import ReactDOM from 'react-dom/client'
import App from './AppV2';

const ClientApp = (
    <App/>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);