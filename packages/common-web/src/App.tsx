import { useMemo } from "react";
import NotFound from "@floro/common-web/src/pages/errors/NotFound";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route } from "react-router-dom";
import { IsomorphicRoute } from "./ssr/routing-helpers";
import { QueryClient, QueryClientProvider } from "react-query";
import { FloroSocketProvider } from "@floro/common-react/src/pubsub/socket";
import { SessionProvider } from "@floro/common-react/src/session/session-context";
import {OfflinePhotoProvider} from "@floro/common-react/src/offline/OfflinePhotoContext";
import {OfflineIconProvider} from "@floro/common-react/src/offline/OfflineIconsContext";

import "./index.css";
import FloroMount from "./floro_listener/FloroMount";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";

export interface Props {
  routing: IsomorphicRoute[];
  text: LocalizedPhrases;
}

function App(props: Props) {
  const colorTheme = useColorTheme();
  const queryClient = useMemo(() => new QueryClient(), []);
  const notFound = useMemo(() => <NotFound />, []);

  return (
    <FloroMount text={props.text}>
      <ThemeProvider theme={colorTheme}>
        <QueryClientProvider client={queryClient}>
          <FloroSocketProvider client={"web"}>
            <OfflineIconProvider>
              <OfflinePhotoProvider>
                <SessionProvider>
                  <Routes>
                    {props.routing.map((route, key) => {
                      const Page = route.component();
                      return (
                        <Route key={key} path={route.path} element={<Page />} />
                      );
                    })}
                    <Route path="*" element={notFound} />
                  </Routes>
                </SessionProvider>
              </OfflinePhotoProvider>
            </OfflineIconProvider>
          </FloroSocketProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </FloroMount>
  );
}

export default App;
