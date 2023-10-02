import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { createUploadLink } from 'apollo-upload-client';
import Cookies from "js-cookie";

export const createApolloClient = (hostname: string, isSecure = false) => {
  const authMiddleware = setContext((_, { headers }) => {
    // add the authorization to the headers
    const token = Cookies.get("user-session");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
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

  const uploadLink = createUploadLink();
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink.concat(uploadLink)
  );

  const cache = new InMemoryCache({
    typePolicies: {
      Repository: {
        fields: {
          branchState: {
            merge(existing, incoming) {
              return {
                ...existing,
                ...incoming,
              }
            }
          }
        }
      }
    }
  }).restore(window.__APOLLO_STATE__ ?? {});
  return new ApolloClient({
    link: authMiddleware.concat(splitLink),
    cache,
  });
};
