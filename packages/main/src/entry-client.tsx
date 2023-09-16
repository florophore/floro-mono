import { ApolloCache, ApolloClient, ApolloProvider, NormalizedCache } from '@apollo/client';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from '@floro/common-web/src/App';
import { MainRoutes } from '@floro/common-web/src/Routing';
import { createApolloClient } from '@floro/common-web/src/apollo/create-apollo-client';

console.log("ENV TEST", import.meta.env?.['VITE_HOST'], import.meta.env?.['VITE_IS_SECURE'])
const client = createApolloClient(import.meta.env?.['VITE_HOST'] ?? 'localhost:9000', !!import.meta.env?.['VITE_IS_SECURE']);
console.log("META", import.meta.env)

const ClientApp = (
  <ApolloProvider client={client as unknown as ApolloClient<NormalizedCache>}>
    <BrowserRouter>
      <App routing={MainRoutes} />
    </BrowserRouter>
  </ApolloProvider>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);