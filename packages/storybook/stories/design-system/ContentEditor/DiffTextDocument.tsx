import React, {
  useMemo,
  useCallback,
  useState,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ExtendLight from "@floro/common-assets/assets/images/rich_text_icons/extend.light.svg";
import ExtendDark from "@floro/common-assets/assets/images/rich_text_icons/extend.dark.svg";

import ContractLight from "@floro/common-assets/assets/images/rich_text_icons/contract.light.svg";
import ContractDark from "@floro/common-assets/assets/images/rich_text_icons/contract.dark.svg";

import ColorPalette from "@floro/styles/ColorPalette";
import { StringDiff } from "floro/dist/src/sequenceoperations";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
`;

const MainContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 100%;
  height: 100%;
  display: block;
  resize: vertical;
`;

const Wrapper = styled.div`
  position: relative;
  border-radius: 8px;
  font-size: 1.4rem;
`;

const StickyHeader = styled.div`
    height: 56px;
    width: 100%;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    border-top: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-left: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-right: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    box-shadow: 0px 2px 2px 2px
      ${(props) => props.theme.shadows.versionControlSideBarShadow};
`;

const HeaderIcon = styled.img`
    height: 32px;
    width: 32px;
`;

const DisabledTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.gray};
  font-style: italic;
  cursor: pointer;
  margin: 0;
  padding: 0;
`;

export interface Props {
  maxHeight?: number;
  beforeStrings: string[];
  afterStrings: string[];
  diff: StringDiff;
  lang?: string;
  delimiter?: string;
  showLastDelimitedBeforeValue?: boolean;
  showLastDelimitedAfterValue?: boolean;
}

const DiffTextDocument = (props: Props) => {
  const theme = useTheme();
  const [showExtendAfter, setShowExtendAfter] = useState(true);

  const stickyStylesAfter = useMemo((): any => {
    if (showExtendAfter) {
      return {
        minHeight: 120, overflowY: 'initial', height: '100%'
      }
    }
    return {
      minHeight: 120, height: 200, maxHeight: 800, overflowY: 'scroll'
    }

  }, [showExtendAfter])

  const onToggleExtendAfter = useCallback(() => {
    setShowExtendAfter(!showExtendAfter);
  }, [showExtendAfter])


  const [showExtendBefore, setShowExtendBefore] = useState(true);

  const stickyStylesBefore = useMemo((): any => {
    if (showExtendBefore) {
      return {
        minHeight: 120, overflowY: 'initial', height: '100%'
      }
    }
    return {
      minHeight: 120, height: 200, maxHeight: 800, overflowY: 'scroll'
    }

  }, [showExtendBefore])

  const onToggleExtendBefore = useCallback(() => {
    setShowExtendBefore(!showExtendBefore);
  }, [showExtendBefore])

  const extendIcon = useMemo(() => {
    if (theme.name == 'light') {
      return ExtendLight;
    }
    return ExtendDark;
  }, [theme.name])

  const contractIcon = useMemo(() => {
    if (theme.name == 'light') {
      return ContractLight;
    }
    return ContractDark;
  }, [theme.name]);

  const addedChanges = useMemo(() => {
    return new Set(Object.keys(props.diff.add).map(p => parseInt(p)));
  }, [props.diff.add]);

  const removedChanges = useMemo(() => {
    return new Set(Object.keys(props.diff.remove).map(p => parseInt(p)));
  }, [props.diff.remove]);


  const afterContent = useMemo(() => {
    return props.afterStrings.map(
      (sentence, index) => {
        const isLast = index == props.afterStrings.length -1;
        return (
          <React.Fragment key={index}>
            <span
              style={{
                background: addedChanges.has(index)
                  ? ColorPalette.teal
                  : "none",
                color: addedChanges.has(index)
                  ? ColorPalette.black
                  : theme.colors.contrastText,
                fontWeight: addedChanges.has(index) ? 500 : 400,
                paddingLeft: addedChanges.has(index) ? 4 : 0,
                paddingRight: addedChanges.has(index) ? 4 : 0,
              }}
            >
              {sentence}
            </span>{!isLast || props.showLastDelimitedAfterValue ? props.delimiter ?? " " : ""}
          </React.Fragment>
        );
      }
    )

  }, [addedChanges, props.afterStrings, theme, props.delimiter, props.showLastDelimitedAfterValue]);

  const beforeContent = useMemo(() => {
    return props.beforeStrings.map(
      (sentence, index) => {
        const isLast = index == props.beforeStrings.length -1;
        return (
          <React.Fragment key={index}>
            <span
              style={{
                background: removedChanges.has(index)
                  ? ColorPalette.lightRed
                  : "none",
                color: removedChanges.has(index)
                  ? ColorPalette.black
                  : theme.colors.contrastText,
                fontWeight: removedChanges.has(index) ? 500 : 400,
                paddingLeft: removedChanges.has(index) ? 4 : 0,
                paddingRight: removedChanges.has(index) ? 4 : 0,
              }}
            >
              {sentence}
            </span>{!isLast || props.showLastDelimitedBeforeValue ? props.delimiter ?? " " : ""}
          </React.Fragment>
        );
      }
    )
  }, [removedChanges, props.beforeStrings, theme, props.delimiter, props.showLastDelimitedBeforeValue]);

  return (
    <>
      <Container lang={props.lang}>
        <StickyHeader>
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row' }}>
            <DisabledTitle style={{color: theme.colors.addedText}}>{'After'}</DisabledTitle>
          </div>
          <div>
            {showExtendAfter && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={contractIcon}
                onClick={onToggleExtendAfter}
              />
            )}
            {!showExtendAfter && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={extendIcon}
                onClick={onToggleExtendAfter}
              />
            )}
          </div>
        </StickyHeader>
        <MainContainer
          style={{
            padding: 24,
            color: theme.colors.contrastText,
            ...stickyStylesAfter,
            borderRadius: 0,
            background: theme.background
          }}
        >
          <Wrapper>
            {props.afterStrings.length == 0 && (
              <div style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                top: 0,
                left: 0,
                fontFamily: "MavenPro",
                color: theme.colors.inputPlaceholderTextColor,
              }}>
                {"Empty after"}
              </div>
            )}
            <div
              style={{
                pointerEvents: "none",
                fontFamily: "MavenPro",
              }}
            >
              <div
                style={{
                  whiteSpace: "pre-line",
                  width: "100%",
                  display: "inline-block",
                }}
                spellCheck
                lang={props.lang}
              >{afterContent}</div>
            </div>
          </Wrapper>
        </MainContainer>
        <StickyHeader style={{borderRadius: 0, borderTop: 0}}>
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row' }}>
            <DisabledTitle style={{color: theme.colors.removedText}}>{'Before'}</DisabledTitle>
          </div>
          <div>
            {showExtendBefore && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={contractIcon}
                onClick={onToggleExtendBefore}
              />
            )}
            {!showExtendBefore && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={extendIcon}
                onClick={onToggleExtendBefore}
              />
            )}
          </div>
        </StickyHeader>
        <MainContainer
          style={{
            padding: 24,
            color: theme.colors.contrastText,
            ...stickyStylesBefore,
            background: theme.background
          }}
        >
          <Wrapper>
            {props.beforeStrings.length == 0 && (
              <div style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                top: 0,
                left: 0,
                fontFamily: "MavenPro",
                color: theme.colors.inputPlaceholderTextColor
              }}>
                {"Empty before"}
              </div>
            )}
            <div
              style={{
                pointerEvents: "none",
                fontFamily: "MavenPro",
              }}
            >
              <div
                style={{
                  whiteSpace: "pre-line",
                  width: "100%",
                  display: "inline-block",
                }}
                spellCheck
                lang={props.lang}
              >{beforeContent}</div>
            </div>
          </Wrapper>
        </MainContainer>
      </Container>
    </>
  );
};

export default React.memo(DiffTextDocument);
