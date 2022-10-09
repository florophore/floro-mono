import React from "react";
import { ThemeProvider } from "@emotion/react";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route, Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to={"/about"}>About</Link>
    </div>
  );
};

const About = () => {
  return (
    <div>
      <h1>About</h1>
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
