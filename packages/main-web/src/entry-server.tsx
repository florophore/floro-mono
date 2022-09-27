import React from 'react';
import App from './App';
import { StaticRouter } from "react-router-dom/server";
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { main } from '@floro/graphql-schemas'; 
import { renderToStringWithData } from '@apollo/client/react/ssr';

export const render = async (url: string, deps: {client: ApolloClient<main.Resolvers>}) => {
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