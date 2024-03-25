import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../../floro_listener/hooks/locales";
import ColorPalette from "@floro/styles/ColorPalette";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { LinkChain, useLinkTitle } from "./DocsLink";
import { useDocSearch } from "./hooks/doc-search";
import DocResult from "./DocResult";
import { useNavigate } from "react-router-dom";

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

const SearchContainer = styled.div`
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  width: 100%;
  box-shadow: 0px 6px 6px 6px ${props => props.theme.colors.tooltipOuterShadowColor};
  margin-bottom: 16px;
`;

const SearchInnerContainer = styled.div`
  box-shadow: inset 0 0 3px
    ${(props) => props.theme.colors.tooltipInnerShadowColor};
  padding: 8px;
  border-radius: 8px;
`;

const InstructionsText = styled.p`
  padding: 0;
  margin: 12px 0 12px 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${ColorPalette.gray};
`;

interface Props {
    linkChain: LinkChain;
    lastSectionTitleChain?: LinkChain;
    docs: "product"|"development"
}

function DocsSearch(props: Props) {
  const theme = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const linkTitle = useLinkTitle(props.linkChain, []);
  const lastSectionTitleChain = useLinkTitle(
    props.lastSectionTitleChain ?? { label: "", value: "" },
    [props.lastSectionTitleChain]
  );
  const page = usePlainText("docs.search_product_docs_page");
  const lastSection = usePlainText("docs.search_product_docs_last_section");
  const productPlaceholder = usePlainText("docs.search_product_docs");
  const developerPlaceholder = usePlainText("docs.search_developer_docs");

  const searchingProduct = useRichText("docs.searching_product_docs");
  const searchingDevelopment = useRichText("docs.searching_developer_docs");
  const noResultsFound = useRichText("docs.no_results_found");


  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchResults = useDocSearch(props.docs, searchValue);
  const navigate = useNavigate()

  const queryIsEmpty = useMemo(() => {
    return (searchValue?.trim() ?? "") == "";
  }, [searchValue]);

  const searchLength = useMemo(
    () => searchResults.length,
    [searchResults.length]
  );

  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);

  const onFocusSearch = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const onBlurSearch = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const isSearchEmpty = useMemo(() => {
    if (searchResults?.length > 0) {
      return false;
    }
    return true;
  }, [searchResults]);

  const onSelectIndex = useCallback(
    (index: number | null) => {
      if (index == null) {
        return;
      }
      const result = searchResults[index];
      navigate(result.path);
    },
    [searchResults]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (searchLength == 0) {
        setSelectedIndex(null);
        return null;
      }
      if (event?.code == "ArrowUp" || event?.code == "ArrowDown") {
        event.preventDefault();
      }
      if (event?.code == "ArrowUp") {
        if (selectedIndex == null) {
          setSelectedIndex(searchLength - 1);
          return;
        }
      }
      if (event?.code == "ArrowDown") {
        if (selectedIndex == null) {
          setSelectedIndex(0);
          return;
        }
      }

      if (event?.code == "ArrowUp") {
        if (selectedIndex == 0) {
          setSelectedIndex(searchLength - 1);
          return;
        }
        setSelectedIndex((selectedIndex ?? searchLength) - 1);
        return;
      }
      if (event?.code == "ArrowDown") {
        if (selectedIndex == searchLength - 1) {
          setSelectedIndex(0);
          return;
        }
        setSelectedIndex((selectedIndex ?? -1) + 1);
        return;
      }
      if (event?.code == "Enter") {
        onSelectIndex(selectedIndex);
        searchRef.current?.blur();
      }
    },
    [selectedIndex, searchResults, searchLength, onSelectIndex]
  );

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
      {props.lastSectionTitleChain && (
        <Row style={{ marginTop: 12 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TitleSpan style={{ color: theme.colors.contrastTextLight }}>
              {lastSection + " "}
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
              {lastSectionTitleChain}
            </TitleSpan>
          </span>
        </Row>
      )}
      <Row style={{ marginTop: 24, position: "relative" }}>
        <SearchInput
          borderColor={theme.colors.inputBorderColor}
          value={searchValue}
          placeholder={
            props.docs == "development"
              ? developerPlaceholder
              : productPlaceholder
          }
          onTextChanged={setSearchValue}
          onKeyDown={onKeyDown}
          onFocus={onFocusSearch}
          onBlur={onBlurSearch}
          ref={searchRef}
          showClear
        />

        {(isSearchFocused) && (
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              display: "block",
              textAlign: "left",
              position: "absolute",
              left: 0,
              top: 56,
              zIndex: 2,
            }}
          >
            <SearchContainer>
              <SearchInnerContainer>
                {queryIsEmpty && (
                  <InstructionsText>
                    {props.docs == "development" ? searchingDevelopment : searchingProduct}
                  </InstructionsText>
                )}
                {searchResults.length == 0 && !queryIsEmpty && (
                  <InstructionsText>{noResultsFound}</InstructionsText>
                )}
                {isSearchFocused && !isSearchEmpty && !queryIsEmpty && (
                  <>
                    <div style={{ padding: 8 }}>
                      {searchResults?.map((docResult, index) => {
                        return (
                          <div
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              onSelectIndex(index);
                            }}
                            onMouseOver={() => {
                              setSelectedIndex(index);
                            }}
                            key={index}
                          >
                            <DocResult
                              docResult={docResult}
                              isSelected={index == selectedIndex}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </SearchInnerContainer>
            </SearchContainer>
          </div>
        )}
      </Row>
    </Container>
  );
}

export default React.memo(DocsSearch);