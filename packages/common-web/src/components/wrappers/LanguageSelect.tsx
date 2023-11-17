import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useLocales } from "../../floro_listener/hooks/locales";

const Wrapper = styled.div`
  width: 60px;
  height: 40px;
  border-left: 1px solid
    ${(props) =>
      props.theme.name == "light"
        ? ColorPalette.lightGray
        : ColorPalette.darkerGray};
  margin-right: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
  position: relative;
  user-select: none;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

`;

const LangIcon = styled.img`
  height: 20px;
`;

const DropdownIcon = styled.img`
  height: 20px;
`;


const LangOption = styled.p`
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  margin: 8px 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.contrastText};
  &:hover {
    color: ${props => props.theme.colors.linkColor};
    cursor: pointer;
  }
`;

interface Props {}

const LanguageSelect = (props: Props) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const langIcon = useIcon(
    "front-page.language",
    isHovered ? "hovered" : undefined
  );
  const dropdownIcon = useIcon(
    "front-page.drop-down-arrow",
    isHovered ? "hovered" : undefined
  );

  const {setSelectedLocaleCode, selectedLocaleCode} = useLocales();

  return (
    <Wrapper onMouseLeave={() => setIsHovered(false)}>
      <ImageWrapper onMouseEnter={() => setIsHovered(true)}>
        <LangIcon src={langIcon} />
        <DropdownIcon src={dropdownIcon} />
      </ImageWrapper>
      <div
        className={css`
          display: ${isHovered ? "block" : "none"};
          position: absolute;
          top: 100%;
          width: 120px;
          right: 0;
        `}
      >
        <div
          className={css`
            height: 100%;
            margin-left: 8px;
            width: calc(100% - 8px);
            border-radius: 8px;
            box-sizing: border-box;
            box-shadow: 0 0 20px 1px ${theme.colors.tooltipOuterShadowColor};
          `}
        >
          <div
            className={css`
              background: ${theme.background};
              padding: 16px;
              box-shadow: inset 0 0 3px ${theme.colors.tooltipInnerShadowColor};
              border-radius: 8px;
            `}
          >
            <LangOption
              style={{
                fontWeight: selectedLocaleCode == "EN" ? 600 : 400,
              }}
              onClick={() => {
                setSelectedLocaleCode("EN");
              }}
            >
              {"English"}
            </LangOption>
            <LangOption
              style={{
                fontWeight: selectedLocaleCode == "ZH" ? 600 : 400,
              }}
              onClick={() => {
                setSelectedLocaleCode("ZH");
              }}
            >
              {"简体中文"}
            </LangOption>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default React.memo(LanguageSelect);
