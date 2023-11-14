import { ApolloCache, ApolloClient, ApolloProvider, NormalizedCache } from '@apollo/client';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from '@floro/common-web/src/App';
import { MainRoutes } from '@floro/common-web/src/Routing';
import { createApolloClient } from '@floro/common-web/src/apollo/create-apollo-client';
import FloroMount from '@floro/common-web/src/floro_listener/FloroMount';
import initText from "@floro/common-generators/floro_modules/text-generator";


const client = createApolloClient(import.meta.env?.['VITE_HOST'] ?? 'localhost:9000', !!import.meta.env?.['VITE_IS_SECURE']);

const ClientApp = () => {
  //@ts-ignore
  const text = import.meta.env?.MODE == "development" ? initText : window.__FLORO_TEXT__ ?? initText;
  return (
    <ApolloProvider client={client as unknown as ApolloClient<NormalizedCache>}>
      <BrowserRouter>
          <App text={text} routing={MainRoutes} env={import.meta.env?.VITE_BUILD_ENV_NORMALIZED ?? "development"} />
      </BrowserRouter>
    </ApolloProvider>
  )
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp());