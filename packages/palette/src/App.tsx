import React, { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { Routes, Route, Link } from "react-router-dom";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import "./index.css";
import {
  FloroProvider,
  useFloroContext,
  useFloroState,
} from "./floro-schema-api";
import ShadeEditList from "./ShadeEditList";
import ColorEditList from "./ColorEditList";
import ShadeReadList from "./ShadeReadList";
import ColorReadList from "./ColorReadList";

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
`

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${props => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`

const Layout = () => {
  const commandMode = useFloroContext().commandMode;
  return (
    <Container>
      {true &&
      <>
        <div style={{marginBottom: 36}}>
          <SectionTitle>{'Shades'}</SectionTitle>
          {commandMode == "edit" && <ShadeEditList/>}
          {commandMode != "edit" && <ShadeReadList/>}
        </div>
        <div style={{marginBottom: 36}}>
          <SectionTitle>{'Colors'}</SectionTitle>
          {commandMode == "edit" && <ColorEditList/>}
          {commandMode != "edit" && <ColorReadList/>}
        </div>
        <div style={{marginBottom: 36}}>
          <SectionTitle>{'Palette'}</SectionTitle>
        </div>
      </>

      }
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
