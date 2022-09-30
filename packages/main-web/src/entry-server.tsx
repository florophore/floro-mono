import React from 'react';
import App from './App';
import { StaticRouter } from "react-router-dom/server";
import  ApolloPackage from '@apollo/client';
import { main } from '@floro/graphql-schemas'; 
import RedirectProvider from './ssr/RedirectProvider';
import { renderToStringWithData } from '@apollo/client/react/ssr';
import { ApolloProvider, ApolloClient } from '@apollo/client';

export const render = async (url: string, deps: {client: ApolloClient<any>}, context: {url?: string, should404: boolean, isSSR: boolean}) => {
    const SSRApp = (
      <ApolloProvider client={deps.client}>
        <StaticRouter location={url}>
          <RedirectProvider context={context}>
            <App />
          </RedirectProvider>
        </StaticRouter>
      </ApolloProvider>
    );
    const appHtml = await renderToStringWithData(SSRApp);
    const appState = deps.client.extract();
    return {
        appHtml,
        appState
    }
}