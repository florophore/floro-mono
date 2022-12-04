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
import ColorPalette from '@floro/styles/ColorPalette';
import { createUploadLink } from 'apollo-upload-client';

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
    lazy: false,
    disablePong: false,
    keepAlive: 10_000,
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

const cache = new InMemoryCache();

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
                <OfflinePhotoProvider>
                  <SessionProvider>
                    <DOMMount>
                      <Router />
                    </DOMMount>
                  </SessionProvider>
                </OfflinePhotoProvider>
              </FloroSocketProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SystemAPIProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
};
export default App;
