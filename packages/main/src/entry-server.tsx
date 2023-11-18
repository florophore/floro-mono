import React from 'react';
import App from '@floro/common-web/src/App';
import { StaticRouter } from "react-router-dom/server";
import { MainRoutes } from '@floro/common-web/src/Routing';
import RedirectProvider from '@floro/common-web/src/ssr/RedirectProvider';
import { renderToStringWithData } from '@apollo/client/react/ssr';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import { Helmet } from 'react-helmet';
import { LocalizedPhrases } from '@floro/common-generators/floro_modules/text-generator';
import { renderStylesToString } from '@emotion/server';

export const render = async (
  url: string,
  deps: {
    client: ApolloClient<any>;
    floroText: LocalizedPhrases;
    env: string;
    initTheme: string;
    initLocaleCode: keyof LocalizedPhrases["locales"] & string;
  },
  context: { url?: string; should404: boolean; isSSR: boolean }
) => {
  try {
    const SSRApp = (
      <ApolloProvider client={deps.client}>
        <StaticRouter location={url}>
          <RedirectProvider routing={MainRoutes} context={context}>
            <App
              text={deps.floroText}
              routing={MainRoutes}
              env={deps.env}
              initLocaleCode={deps.initLocaleCode}
              initTheme={deps.initTheme}
            />
          </RedirectProvider>
        </StaticRouter>
      </ApolloProvider>
    );
    const appHtml = await renderToStringWithData(SSRApp);
    const helmet = Helmet.renderStatic();
    const appState = deps.client.extract();
    return {
      appHtml: renderStylesToString(appHtml),
      appState,
      helmet,
    };
  } catch (e) {
    return {
      appHtml: "",
      appState: {},
      helmet: {},
    };
  }
};