import React, { useMemo } from 'react';
import { AdminRoutes } from '@floro/common-web/src/Routing';
import NotFound from '@floro/common-web/src/pages/errors/NotFound';
import './App.css'
import { ThemeProvider } from '@emotion/react';
import { useColorTheme } from '@floro/common-web/src/hooks/color-theme';
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  const colorTheme = useColorTheme();
  const notFound = useMemo(() => <NotFound/>, []);

  return (
      <ThemeProvider theme={colorTheme}>
        <Routes>
          {AdminRoutes.map((route, key) => {
            const Page = route.component();
            return (
              <Route key={key} path={route.path} element={
                <React.Suspense>
                  <Page/>
                </React.Suspense>
            }/>
            );
          })}
          <Route path="*" element={notFound}/>
        </Routes>
      </ThemeProvider>
  );
}

export default App;
