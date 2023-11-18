import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import Button from "@floro/storybook/stories/design-system/Button";
import ScreenShotLight from "@floro/main/public/pngs/light.no_edge.png";
import ScreenShotDark from "@floro/main/public/pngs/dark.no_edge.png";
import CLICopy from "../../components/home/CLICopy";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../components/wrappers/PageWrapper";

const AboutWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const LargeNavInfo = styled.div`
  flex-direction: row;
  height: 100%;
  width: 100%;
  padding-left: 48px;
  align-items: center;
  justify-content: space-between;
  @media screen and (min-width: 1024px) {
    display: flex;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    display: flex;
  }
  @media screen and (max-width: 767px) {
    display: none;
  }
`;

function AboutPage() {
  const theme = useTheme();
  const floroText = useIcon("main.floro-text");
  const aboutMetaTitle = usePlainText("meta_tags.about");

  return (
    <PageWrapper>
      <Helmet>
        <title>{aboutMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <h1>{'about page'}</h1>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;