import React from "react";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route, Link } from "react-router-dom";
import WarningLabel from '@floro/storybook/stories/design-system/WarningLabel';

const Home = () => {
  return (
    <div style={{width: '100%'}}>
      <h1>Home</h1>
      <Link to={"/about"}>About</Link>
    </div>
  );
};

const About = () => {
  return (
    <div>
      <h1>About</h1>
      <WarningLabel label="testing" size="small"/>
      <Link to={"/"}>Home</Link>
    </div>
  );
};

function App() {
  const colorTheme = useColorTheme();

  return (
    <ThemeProvider theme={colorTheme}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
