import { useCallback, useState, useRef, useEffect } from "react";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { useSelectedTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import { FloroProvider, useFloroContext, useQueryRef, useReferencedObject } from "./floro-schema-api";
import ShadeEditList from "./shades/ShadeEditList";
import ShadeReadList from "./shades/ShadeReadList";
import ColorPaletteMatrix from "./colormatrix/ColorPaletteMatrix";

const Container = styled.div`
  width: 100%;
  padding: 24px 24px 80px 24px;
  flex: 1;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const Layout = () => {
  const container = useRef<HTMLDivElement>(null);
  const [showShadeEdit, setShowShadeEdit] = useState(false);
  const { commandMode, pluginState } = useFloroContext();

  const onShowShadeList = useCallback(() => {
    if (container?.current) {
      container?.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    setShowShadeEdit(true);
  }, []);
  const onHideShadeList = useCallback(() => {
    setShowShadeEdit(false);
  }, []);

  const onScrollToBottom = useCallback(() => {
    container?.current?.scrollTo({
      top: container?.current?.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const colorTheme = useSelectedTheme(pluginState?.themeName ?? "light");

  return (
    <ThemeProvider theme={colorTheme}>
      <Container ref={container}>
        {commandMode != "edit" && <ShadeReadList />}
        {commandMode == "edit" && showShadeEdit && <ShadeEditList />}
        <ColorPaletteMatrix
          showShadeList={showShadeEdit}
          onHideShadeList={onHideShadeList}
          onShowShadeList={onShowShadeList}
          onScrollToBottom={onScrollToBottom}
        />
      </Container>
    </ThemeProvider>
  );
};

function App() {
  return (
    <FloroProvider>
      <Layout />
    </FloroProvider>
  );
}

export default App;
