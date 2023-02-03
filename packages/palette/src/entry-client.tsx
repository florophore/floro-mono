import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const ClientApp = (
    //@ts-ignore next-line
    <BrowserRouter basename={`/plugins/${FLORO_MANIFEST_NAME}/${FLORO_MANIFEST_VERSION}`}>
        <App/>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);