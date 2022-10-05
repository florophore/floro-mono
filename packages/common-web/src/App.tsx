import React, { useMemo } from "react";
import NotFound from "@floro/common-web/src/pages/errors/NotFound";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route } from "react-router-dom";
import { IsomorphicRoute } from "./ssr/routing-helpers";
import "./index.css";

export interface Props {
  routing: IsomorphicRoute[];
}

function App(props: Props) {
  const colorTheme = useColorTheme();
  const notFound = useMemo(() => <NotFound />, []);

  return (
    <ThemeProvider theme={colorTheme}>
      <Routes>
        {props.routing.map((route, key) => {
          const Page = route.component();
          return (
            <Route
              key={key}
              path={route.path}
              element={
                <React.Suspense>
                  <Page />
                </React.Suspense>
              }
            />
          );
        })}
        <Route path="*" element={notFound} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
