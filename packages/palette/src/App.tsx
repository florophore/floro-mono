import React from "react";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route, Link } from "react-router-dom";
import WarningLabel from '@floro/storybook/stories/design-system/WarningLabel';

const Read = () => {
  return (
    <div style={{width: '100%'}}>
      <h1>READ</h1>
      <Link to={"/write"}>WRITE</Link>
    </div>
  );
};

const Edit = () => {
  return (
    <div>
      <h1>WRITE</h1>
      <WarningLabel label="testing" size="small"/>
      <Link to={"/"}>READ</Link>
    </div>
  );
};

function App() {
  const colorTheme = useColorTheme();

  return (
    <ThemeProvider theme={colorTheme}>
      <Routes>
        <Route path="/" element={<Read />} />
        <Route path="/write" element={<Edit />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
