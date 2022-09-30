import React from 'react';
import App from './App';
import { StaticRouter } from "react-router-dom/server";
import  ApolloPackage from '@apollo/client';
import { main } from '@floro/graphql-schemas'; 
import { renderToStringWithData } from '@apollo/client/react/ssr';
import { ApolloProvider } from '@apollo/client';

export const render = async (url: string, deps: {client: any}) => {
    const SSRApp = (
      <ApolloProvider client={deps.client}>
        <StaticRouter location={url}>
          <App />
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