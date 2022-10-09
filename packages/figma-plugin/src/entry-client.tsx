import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const ClientApp = (
    <BrowserRouter basename='/plugins/floro-figma-plugin'>
        <App/>
    </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);