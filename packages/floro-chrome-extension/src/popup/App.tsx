import Popup from "./Popup.tsx";
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { ThemeProvider } from "@emotion/react";
import "../index.css";

const App = (): React.ReactNode => {
  const colorTheme = useColorTheme();
  return (
    <ThemeProvider theme={colorTheme}>
      <Popup/>
    </ThemeProvider>
  );
}

export default App;