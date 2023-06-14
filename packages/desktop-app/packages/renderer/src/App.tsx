import React, {useEffect, useMemo} from 'react';
import {ThemeProvider} from '@emotion/react';
import {BrowserRouter} from 'react-router-dom';
import { LightTheme} from '@floro/styles/ColorThemes';
import Router from './Router';
import {SystemAPIProvider} from './contexts/SystemAPIContext';
import {ApolloClient, ApolloProvider, InMemoryCache, split} from '@apollo/client';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";

import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import {getMainDefinition} from '@apollo/client/utilities';
import DOMMount from '@floro/common-react/src/components/mounts/DOMMount';
import {QueryClient, QueryClientProvider} from 'react-query';
import {FloroSocketProvider} from '@floro/common-react/src/pubsub/socket';
import {setContext} from '@apollo/client/link/context';
import Cookies from 'js-cookie';
import {SessionProvider} from '@floro/common-react/src/session/session-context';
import {OfflinePhotoProvider} from "@floro/common-react/src/offline/OfflinePhotoContext";
import {OfflineIconProvider} from "@floro/common-react/src/offline/OfflineIconsContext";
import ColorPalette from '@floro/styles/ColorPalette';
import { createUploadLink } from 'apollo-upload-client';
import { CurrentUserSubscriberMount } from '@floro/common-react/src/components/subscribers/UserSubscriber';

const authMiddleware = setContext((_, {headers}) => {
  // add the authorization to the headers
  const token = Cookies.get('user-session');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'apollo-require-preflight': true,
    },
  };
});

const wsLink = new GraphQLWsLink(

  createClient({
    url: 'ws://localhost:9000/graphql-subscriptions',
    lazy: true,
    disablePong: false,
    keepAlive: 5_000,
    shouldRetry: () => {
      return true;
    },
    connectionParams: () => {
      const token = Cookies.get('user-session');
      if (!token) {
        return {};
      }
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    }
  }),
);

const uploadLink = createUploadLink({
  uri: 'http://localhost:9000/graphql',
});

const splitLink = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  uploadLink,
);

//const mergeFunction = (existing: object, incoming: object) => {
//  return {
//    ...existing,
//    ...incoming,
//  };
//};

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
  //typePolicies: {
  //  User: {
  //    merge: mergeFunction,
  //  },
  //  Organization: {
  //    merge: mergeFunction,
  //  },
  //  Repository: {
  //    merge: mergeFunction,
  //  },
  //},
});

const client = new ApolloClient({
  link: authMiddleware.concat(splitLink),
  cache,
});

interface Props {
  systemAPI: SystemAPI;
}

const App = (props: Props): React.ReactElement => {
  const queryClient = useMemo(() => new QueryClient(), []);
  const colorTheme = useColorTheme();

  useEffect(() => {
    if (colorTheme == LightTheme) {
      document.body.style.backgroundColor = ColorPalette.lightModeBG;
    } else {
      document.body.style.backgroundColor = ColorPalette.darkModeBG;
    }
  }, [colorTheme]);

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <SystemAPIProvider systemAPI={props.systemAPI}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={colorTheme}>
              <FloroSocketProvider client={'desktop'}>
                <OfflineIconProvider>
                  <OfflinePhotoProvider>
                    <SessionProvider>
                      <CurrentUserSubscriberMount>
                        <DOMMount>
                          <Router />
                        </DOMMount>
                      </CurrentUserSubscriberMount>
                    </SessionProvider>
                  </OfflinePhotoProvider>
                </OfflineIconProvider>
              </FloroSocketProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SystemAPIProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
};
export default App;
