import { useCallback, useState } from 'react';
import { ThemeProvider } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FloroProvider,
  useFloroContext,
} from "./floro-schema-api";
import ShadeEditList from "./ShadeEditList";
import ColorEditList from "./ColorEditList";
import ShadeReadList from "./ShadeReadList";
import ColorReadList from "./ColorReadList";
import ColorPaletteMatrix from "./matrix/ColorPaletteMatrix";

const Container = styled.div`
  width: 100%;
  padding: 24px 24px 80px 24px;
  flex: 1;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
`;

const Layout = () => {

  const [showShadeEdit, setShowShadeEdit] = useState(false);
  const [showColorEdit, setShowColorEdit] = useState(false);
  const { commandMode } = useFloroContext();

  const onShowColorList = useCallback(() => {
    setShowColorEdit(true);
  }, []);
  const onHideColorList = useCallback(() => {
    setShowColorEdit(false);
  }, []);

  const onShowShadeList = useCallback(() => {
    setShowShadeEdit(true);
  }, []);
  const onHideShadeList = useCallback(() => {
    setShowShadeEdit(false);
  }, []);
  if (commandMode == "edit") {
    return (
      <Container>
        {showShadeEdit && (
          <ShadeEditList/>
        )}
        {showColorEdit && (
          <ColorEditList/>
        )}
        <ColorPaletteMatrix
          showColorList={showColorEdit}
          showShadeList={showShadeEdit}
          onHideColorList={onHideColorList}
          onShowColorList={onShowColorList}
          onShowShadeList={onShowShadeList}
          onHideShadeList={onHideShadeList}
        />
      </Container>
    );
  }
  return (
    <Container>
      <ShadeReadList/>
      <ColorReadList/>
      <ColorPaletteMatrix
        showColorList={showColorEdit}
        showShadeList={showShadeEdit}
        onHideColorList={onHideColorList}
        onShowColorList={onShowColorList}
        onShowShadeList={onShowShadeList}
        onHideShadeList={onHideShadeList}
      />
    </Container>
  );
};

function App() {
  const colorTheme = useColorTheme();

  return (
    <FloroProvider>
      <ThemeProvider theme={colorTheme}>
        <Layout />
      </ThemeProvider>
    </FloroProvider>
  );
}

export default App;
