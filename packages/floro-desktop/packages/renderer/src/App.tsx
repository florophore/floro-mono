import React, {useMemo, useCallback} from 'react';
import {MemoryRouter} from 'react-router-dom';
import Router from './Router';
import {SystemAPIProvider} from './contexts/SystemAPIContext';
import {ApolloClient, ApolloProvider, InMemoryCache, split, from} from '@apollo/client';
import {ColorThemeProvider} from '@floro/common-web/src/hooks/ColorThemeProvider';
import {EnvProvider} from '@floro/common-react/src/env/EnvContext';

import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import {getMainDefinition} from '@apollo/client/utilities';
import DOMMount from '@floro/common-react/src/components/mounts/DOMMount';
import {QueryClient, QueryClientProvider} from 'react-query';
import {FloroSocketProvider} from '@floro/common-react/src/pubsub/socket';
import {OpenLinkProvider} from '@floro/common-react/src/links/OpenLinkContext';
import {setContext} from '@apollo/client/link/context';
import {SessionProvider} from '@floro/common-react/src/session/session-context';
import {OfflinePhotoProvider} from '@floro/common-react/src/offline/OfflinePhotoContext';
import {OfflineIconProvider} from '@floro/common-react/src/offline/OfflineIconsContext';
import {createUploadLink} from 'apollo-upload-client';
import {CurrentUserSubscriberMount} from '@floro/common-react/src/components/subscribers/UserSubscriber';
import {PluginMessageProvider} from '@floro/common-react/src/contexts/PluginMessageContext';
import {DesktopSocketProvider} from './contexts/DesktopSocketContext';
import * as linkify from 'linkifyjs';
import DesktopThemeMount from './DesktopThemeMount';
import TimeAgo from 'javascript-time-ago';
import Fathom from 'fathom-react';

import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const authMiddleware = setContext((_, {headers}) => {
  // add the authorization to the headers
  ///const token = Cookies.get('user-session');
  const token = localStorage.getItem('session_key');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'apollo-require-preflight': true,
    },
  };
});

const wsUrl = `${import.meta.env.VITE_IS_SECURE == 'TRUE' ? 'wss' : 'ws'}://${
  import.meta.env.VITE_REMOTE_HOST_URL
}/graphql-subscriptions`;

const httpUrl = `${import.meta.env.VITE_IS_SECURE == 'TRUE' ? 'https' : 'http'}://${
  import.meta.env.VITE_REMOTE_HOST_URL
}/graphql`;

window.REDIRECT_URL = `${import.meta.env.VITE_IS_SECURE == 'TRUE' ? 'https' : 'http'}://${
  import.meta.env.VITE_REMOTE_HOST_URL
}`;

const fathomId = import.meta.env.VITE_DESKTOP_FATHOM_ID;

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    lazy: true,
    disablePong: false,
    keepAlive: 5_000,
    shouldRetry: () => {
      return true;
    },
    connectionParams: () => {
      //const token = Cookies.get('user-session');
      const token = localStorage.getItem('session_key');
      if (!token) {
        return {};
      }
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  }),
);

const uploadLink = createUploadLink({
  uri: httpUrl,
});

const splitLink = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  uploadLink,
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
            };
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: from([authMiddleware, splitLink]),
  cache,
});

interface Props {
  systemAPI: SystemAPI;
  env: string;
}

const themePreference = localStorage.get?.('theme-preference') ?? 'system';

const App = (props: Props): React.ReactElement => {
  console.log('buildVersion', props?.systemAPI?.buildVersion);
  const queryClient = useMemo(() => new QueryClient(), []);

  const openUrl = useCallback((url: string) => {
    const linkifyObject = linkify.find(url)[0];
    props.systemAPI.openUrl(linkifyObject.href);
  }, []);

  return (
    <Fathom siteId={fathomId}>
      <EnvProvider env={props.env}>
        <MemoryRouter>
          <ApolloProvider client={client}>
            <OpenLinkProvider openUrl={openUrl}>
              <SystemAPIProvider systemAPI={props.systemAPI}>
                <QueryClientProvider client={queryClient}>
                  <ColorThemeProvider initThemePreference={themePreference}>
                    <DesktopThemeMount>
                      <FloroSocketProvider client={'desktop'}>
                        <OfflineIconProvider>
                          <OfflinePhotoProvider>
                            <SessionProvider
                              env={import.meta.env.VITE_BUILD_ENV_NORMALIZED}
                              clientType={'app'}
                            >
                              <CurrentUserSubscriberMount>
                                <DesktopSocketProvider>
                                  <PluginMessageProvider>
                                    <DOMMount>
                                      <Router />
                                    </DOMMount>
                                  </PluginMessageProvider>
                                </DesktopSocketProvider>
                              </CurrentUserSubscriberMount>
                            </SessionProvider>
                          </OfflinePhotoProvider>
                        </OfflineIconProvider>
                      </FloroSocketProvider>
                    </DesktopThemeMount>
                  </ColorThemeProvider>
                </QueryClientProvider>
              </SystemAPIProvider>
            </OpenLinkProvider>
          </ApolloProvider>
        </MemoryRouter>
      </EnvProvider>
    </Fathom>
  );
};
export default App;
