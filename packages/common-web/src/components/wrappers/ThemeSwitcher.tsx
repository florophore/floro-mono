import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useRichText } from "../../floro_listener/hooks/locales";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import { useColorTheme } from "../../hooks/ColorThemeProvider";

const Wrapper = styled.div`
  width: 64px;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  padding: 6px;
  margin-right: 6px;
  user-select: none;
`;

const ToggleWrapper = styled.div`
  position: relative;
  height: 28px;
  width: 100%;
  box-shadow: inset 0px 0px 6px
    ${(props) => props.theme.colors.titleText};
  border-radius: 14px;
  cursor: pointer;
`;

const SwitchToggle = styled.div`
  position: absolute;
  top: 3px;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.titleText};
  transition: box-shadow 300ms, left 300ms;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.img`
  height: 16px;
`;

interface Props {}

const LanguageSelect = (props: Props) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const { themePreference, selectColorTheme} = useColorTheme();

  const sunIcon = useIcon("front-page.sun");
  const moonIcon = useIcon("front-page.moon");

  const isLight = useMemo(() => {
    return theme.name == 'light';
  }, [theme.name])

  const onToggle = useCallback(() => {
    if (theme.name == 'light') {
      selectColorTheme('dark');
    } else {
      selectColorTheme('light');
    }
  }, [theme.name])

  return (
    <Wrapper
    >
      <ToggleWrapper
        onClick={onToggle}
      >
        <SwitchToggle
          style={{
            left: isLight ? 4 : 26,
            background: isLight ? ColorPalette.white : ColorPalette.black
          }}
        >
          <Icon src={isLight ? sunIcon : moonIcon}/>

        </SwitchToggle>
      </ToggleWrapper>
    </Wrapper>
  );
};

export default React.memo(LanguageSelect);
