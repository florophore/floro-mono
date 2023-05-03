import { useCallback, useState, useRef } from 'react';
import { ThemeProvider } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FloroProvider,
  useFloroContext,
} from "./floro-schema-api";
import ThemeEditList from './themes/ThemeEditList';
import ThemeReadList from './themes/ThemeReadList';
import ThemeDefMatrix from './themedefmatrix/ThemeDefMatrix';

const Container = styled.div`
  width: 100%;
  padding: 24px 24px 80px 24px;
  flex: 1;
  overflow-y: scroll;
  position: relative;

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

  const container = useRef<HTMLDivElement>(null);
  const [showThemeEdit, setShowThemeEdit] = useState(false);
  const { commandMode, applicationState } = useFloroContext();

  const onShowThemeList = useCallback(() => {
    if (container?.current) {
      container?.current?.scrollTo({top: 0, behavior: "smooth"});
    }
    setShowThemeEdit(true);
  }, []);
  const onHideThemeList = useCallback(() => {
    setShowThemeEdit(false);
  }, []);

  const onScrollToBottom = useCallback(() => {
      container?.current?.scrollTo({top: container?.current?.scrollHeight, behavior: "smooth"})
  }, []);


  return (
    <Container ref={container}>
      {commandMode == "edit" && showThemeEdit && <ThemeEditList />}
      {commandMode != "edit" && <ThemeReadList />}
      <ThemeDefMatrix
        showShadeList={showThemeEdit}
        onHideThemeList={onHideThemeList}
        onShowThemeList={onShowThemeList}
        onScrollToBottom={onScrollToBottom}
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
