import React from 'react';
import App from '@floro/common-web/src/App';
import { StaticRouter } from "react-router-dom/server";
import { MainRoutes } from '@floro/common-web/src/Routing';
import RedirectProvider from '@floro/common-web/src/ssr/RedirectProvider';
import { renderToStringWithData } from '@apollo/client/react/ssr';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { Helmet } from 'react-helmet';

export const render = async (url: string, deps: {client: ApolloClient<any>}, context: {url?: string, should404: boolean, isSSR: boolean}) => {
  try {
      const SSRApp = (
        <ApolloProvider client={deps.client}>
          <StaticRouter location={url}>
            <RedirectProvider routing={MainRoutes} context={context}>
              <App routing={MainRoutes} />
            </RedirectProvider>
          </StaticRouter>
        </ApolloProvider>
      );
      const appHtml = await renderToStringWithData(SSRApp);
      const helmet = Helmet.renderStatic();
      const appState = deps.client.extract();
      return {
          appHtml,
          appState,
          helmet
      }
  } catch(e) {
    console.log("E", e);
      return {
          appHtml: '',
          appState: {},
          helmet: {}
      }
  }
}