import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import Input from "@floro/storybook/stories/design-system/Input";
import {
  getArrayStringDiff,
  getLCS,
  getMergeSequence,
} from "floro/dist/src/sequenceoperations";

const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
`;

const SubSectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const AnimationToggleIcon = styled.img`
  height: 64px;
  width: 64px;
  cursor: pointer;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const AnimationDisabledOverlay = styled.div`
  background: ${(props) => props.theme.colors.disableOverlay};
  top: 0;
  left: 0;
  height: 64px;
  width: 64px;
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  cursor: not-allowed;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const AnimationPlayWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 160px;
  width: 100%;
  @media screen and (max-width: 767px) {
    max-width: 120px;
  }
`;

function AboutPage() {
  const aboutMetaTitle = usePlainText("meta_tags.about");
  return (
    <PageWrapper>
      <Helmet>
        <title>{aboutMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <div
          style={{
            padding: 16,
          }}
        >
          <h1>{'will be about page'}</h1>
        </div>
      </AboutWrapper>
    </PageWrapper>
  )
}

export default AboutPage;
