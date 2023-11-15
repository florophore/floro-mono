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

export interface Props {
  routing: IsomorphicRoute[];
  text: LocalizedPhrases;
  env: string;
}

function App(props: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const notFound = useMemo(() => <NotFound />, []);

  const openUrl = useCallback((url: string) => {
    window.open(url);
  }, []);
  return (
    <EnvProvider env={props.env}>
      <OpenLinkProvider openUrl={openUrl}>
        <FloroMount text={props.text}>
          <ColorThemeProvider>
            <ThemeMount>
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
    </EnvProvider>
  );
}

export default App;
