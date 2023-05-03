import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { SchemaTypes, useFloroState, useHasIndication, useIsFloroInvalid, useReferencedObject } from "../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ThemeEditItem from "./ThemeEditItem";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import ThemeReadItem from "./ThemeReadItem";

const ThemeRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const AddShadeContainer = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 568px;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 472px;
`;

const TitleTextWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;



const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 608px;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 16px;
  margin-top: 4px;
`;

const ThemeReadList = () => {
  const theme = useTheme();
  const themes = useReferencedObject("$(theme).themes");
  const isInvalid = useIsFloroInvalid("$(theme).themes");

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name])

  return (
    <div style={{marginBottom: 36}}>
      <TitleWrapper>
        <TitleRow>
          <TitleTextWrapper>
            <SectionTitle>{"Themes"}</SectionTitle>
            {isInvalid && (
              <WarningIconImg src={warningIcon}/>
            )}
          </TitleTextWrapper>
        </TitleRow>
      </TitleWrapper>
      <AnimatePresence>
        <ThemeRow>
            <AnimatePresence>
              {themes?.map((themeObject, index) => {
                return (
                  <ThemeReadItem key={themeObject.id} themeObject={themeObject} index={index} />
                );
              })}
            </AnimatePresence>
        </ThemeRow>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ThemeReadList);
