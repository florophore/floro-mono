import React, { useMemo } from "react";
import NotFound from "@floro/common-web/src/pages/errors/NotFound";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route } from "react-router-dom";
import { IsomorphicRoute } from "./ssr/routing-helpers";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc, trpcClient, protectedTrpc, protectedTrpcClient } from "./trpc";
import { FloroSocketProvider } from '@floro/common-react/src/pubsub/socket';

import "./index.css";

export interface Props {
  routing: IsomorphicRoute[];
}

function App(props: Props) {
  const colorTheme = useColorTheme();
  const queryClient = useMemo(() => new QueryClient(), []);
  const notFound = useMemo(() => <NotFound />, []);

  return (
    <ThemeProvider theme={colorTheme}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <protectedTrpc.Provider
          client={protectedTrpcClient}
          queryClient={queryClient}
        >
          <QueryClientProvider client={queryClient}>
            <FloroSocketProvider client={'web'}>
              <Routes>
                {props.routing.map((route, key) => {
                  const Page = route.component();
                  return <Route key={key} path={route.path} element={<Page />} />;
                })}
                <Route path="*" element={notFound} />
              </Routes>
            </FloroSocketProvider>
          </QueryClientProvider>
        </protectedTrpc.Provider>
      </trpc.Provider>
    </ThemeProvider>
  );
}

export default App;
