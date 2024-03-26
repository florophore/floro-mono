import { useMemo, useCallback } from "react";
import NotFound from "@floro/common-web/src/pages/errors/NotFound";
import { Routes, Route } from "react-router-dom";
import { IsomorphicRoute } from "./ssr/routing-helpers";
import { QueryClient, QueryClientProvider } from "react-query";
import { FloroSocketProvider } from "@floro/common-react/src/pubsub/socket";
import { OpenLinkProvider } from "@floro/common-react/src/links/OpenLinkContext";
import { SessionProvider } from "@floro/common-react/src/session/session-context";
import { OfflinePhotoProvider } from "@floro/common-react/src/offline/OfflinePhotoContext";
import { OfflineIconProvider } from "@floro/common-react/src/offline/OfflineIconsContext";

import "./index.css";
import FloroMount from "./floro_listener/FloroMount";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import { EnvProvider } from "@floro/common-react/src/env/EnvContext";
import { ColorThemeProvider } from "./hooks/ColorThemeProvider";
import ThemeMount from "./hooks/ThemeMount";
import { ThemeSet } from "@floro/common-generators/floro_modules/themes-generator";
import TimeAgo from "javascript-time-ago";
import {Helmet} from "react-helmet";

import en from "javascript-time-ago/locale/en";
import { UserAgentProvider } from "./components/contexts/UAContext";

TimeAgo.addDefaultLocale(en);

export interface Props {
  routing: IsomorphicRoute[];
  text: LocalizedPhrases;
  env: string;
  initTheme: string;
  initLocaleCode: keyof LocalizedPhrases["locales"] & string;
  cdnHost: string;
  ssrPhraseKeySet?: Set<string>;
  localeLoads: { [key: string]: string };
  disableSSRText?: boolean;
  fathomId: string;
  userAgent: string;
}

function App(props: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const notFound = useMemo(() => <NotFound />, []);

  const openUrl = useCallback((url: string) => {
    window.open(url);
  }, []);
  return (
    <UserAgentProvider userAgent={props.userAgent}>
      <EnvProvider env={props.env}>
        <>
          <Helmet>
            <script
              src="https://cdn.usefathom.com/script.js"
              data-site={props.fathomId}
              data-spa="auto"
              defer
            ></script>
          </Helmet>
          <OpenLinkProvider openUrl={openUrl}>
            <FloroMount
              ssrPhraseKeySet={props.ssrPhraseKeySet}
              cdnHost={props.cdnHost}
              text={props.text}
              initLocaleCode={props.initLocaleCode}
              localeLoads={props.localeLoads}
              disableSSRText={props.disableSSRText}
            >
              <ColorThemeProvider initThemePreference={props.initTheme}>
                <ThemeMount initTheme={props.initTheme as keyof ThemeSet}>
                  <QueryClientProvider client={queryClient}>
                    <FloroSocketProvider client={"web"}>
                      <OfflineIconProvider>
                        <OfflinePhotoProvider>
                          <SessionProvider clientType="web" env={props.env}>
                            <Routes>
                              {props.routing.map((route, key) => {
                                const Page = route.component();
                                return (
                                  <Route
                                    key={key}
                                    path={route.path}
                                    element={<Page />}
                                  />
                                );
                              })}
                              <Route path="*" element={notFound} />
                            </Routes>
                          </SessionProvider>
                        </OfflinePhotoProvider>
                      </OfflineIconProvider>
                    </FloroSocketProvider>
                  </QueryClientProvider>
                </ThemeMount>
              </ColorThemeProvider>
            </FloroMount>
          </OpenLinkProvider>
        </>
      </EnvProvider>
    </UserAgentProvider>
  );
}

export default App;
