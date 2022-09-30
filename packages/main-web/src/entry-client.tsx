import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App'
import './index.css'

const cache = new InMemoryCache().restore(window.__APOLLO_STATE__ ?? {});
console.log("TEST", window.__APOLLO_STATE__)
const client = new ApolloClient({
  link: createHttpLink({
    uri: "http://localhost:9000/graphql",
    credentials: "same-origin"
  }),
  cache
});

const ClientApp = (
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp);
