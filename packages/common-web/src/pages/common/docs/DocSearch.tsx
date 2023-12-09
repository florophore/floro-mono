import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { LinkChain, useLinkTitle } from "./DocsLink";

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
  @media screen and (max-width: 767px) {
    font-size: 2rem;
  }
`;

const SubSectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.7rem;
  }
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.2rem;
  }
`;

const PluginRow = styled.div`
  display: flex;
  flex-direction: row;

`;

const PluginIcon = styled.img`
  height: 64px;
  width: 64px;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const PluginTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  @media screen and (max-width: 767px) {
    font-size: 1rem;
  }
`;

const PluginDescription = styled.p`
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-style: italic;
  margin-top: 4px;
  @media screen and (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const TitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.linkColor};
  white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 188px;
`;

const RightRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 252px;
`;

interface Props {
    linkChain: LinkChain;
    docs: "product"|"development"
}

function DocsSearch(props: Props) {
  const theme = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const linkTitle = useLinkTitle(props.linkChain, [])
  const page = usePlainText("docs.search_product_docs_page");
  const productPlaceholder = usePlainText("docs.search_product_docs");
  const developerPlaceholder = usePlainText("docs.search_developer_docs");

  return (
    <Container>
      <Row>
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <TitleSpan style={{ color: theme.colors.contrastTextLight }}>
            {page + " "}
          </TitleSpan>
          <TitleSpan
            style={{
              fontWeight: 500,
              wordWrap: "break-word",
              display: "block",
              whiteSpace: "normal",
              marginLeft: 8,
            }}
          >
            {linkTitle}
          </TitleSpan>
        </span>
      </Row>
      <Row style={{ marginTop: 24 }}>
        <SearchInput
          borderColor={theme.colors.inputBorderColor}
          value={searchValue}
          placeholder={
            props.docs == "development"
              ? developerPlaceholder
              : productPlaceholder
          }
          onTextChanged={setSearchValue}
          showClear
        />
      </Row>
    </Container>
  );
}

export default React.memo(DocsSearch);