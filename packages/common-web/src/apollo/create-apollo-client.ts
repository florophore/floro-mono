import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

export const createApolloClient = (
  hostname: string,
  isSecure = false
) => {
  const httpLink = new HttpLink({
    uri: `${isSecure ? "https" : "http"}://${hostname}/graphql`,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${isSecure ? "wss" : "ws"}://${hostname}/graphql-subscriptions`,
      lazy: false,
      disablePong: false,
      keepAlive: 10_000,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const cache = new InMemoryCache().restore(window.__APOLLO_STATE__ ?? {});
  return new ApolloClient({
    link: splitLink,
    cache,
  });
};