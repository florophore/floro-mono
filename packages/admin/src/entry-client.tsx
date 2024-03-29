import { ApolloClient, ApolloProvider, NormalizedCache } from '@apollo/client';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from '@floro/common-web/src/App';
import { MainRoutes } from '@floro/common-web/src/Routing';
import { createApolloClient } from '@floro/common-web/src/apollo/create-apollo-client';

const client = createApolloClient('localhost:8000');

const ClientApp = (
  <ApolloProvider client={client as unknown as ApolloClient<NormalizedCache>}>
    <BrowserRouter>
      <App routing={MainRoutes} />
    </BrowserRouter>
  </ApolloProvider>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);