import React from 'react';
import App from './App';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";
export const render = (url: string, context?: any) => {
    return renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    );
}