import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";
import {
  PointerTypes,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useIsFloroInvalid,
  useReferencedObject,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { SchemaTypes } from "../floro-schema-api";
import Button from "@floro/storybook/stories/design-system/Button";
import { AnimatePresence, Reorder } from "framer-motion";
import ColorPalette from "@floro/styles/ColorPalette";
import Input from "@floro/storybook/stories/design-system/Input";
import ThemeRow from "./ThemeRow";

const Container = styled.div`
  padding: 0px;
  position: relative;
  max-height: 100%;
  overflow-y: scroll;
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

const SubTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SubTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 0;
`;

const ButtonContainer = styled.div`
  width: 256px;
`;
const AddColorContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 568px;
`;

interface Props {
  show: boolean;
  remappedSVG?: string;
  themingHex?: string;
  defaultIconTheme: string;
  selectedVariants?: {[key: string]: boolean};
  appliedThemes?: {[key: string]: PointerTypes['$(theme).themeColors.id<?>']};
  onSelect?: (themeColorRef: PointerTypes['$(theme).themeColors.id<?>']) => void;
  onNoTheme?: (hex: string) => void;
}

const ThemeDefMatrix = (props: Props) => {

  const container = useRef<HTMLDivElement>(null);
  const themeColors = useReferencedObject("$(theme).themeColors")

  useEffect(() => {
    if (props.show) {
      if (container.current) {
        container.current.scrollTo(0, 0);
      }
    }
  }, [props.show])

  return (
    <Container ref={container}>
      <div>
        <div style={{ marginBottom: 120}}>
          {themeColors
            ?.filter?.((v) => !!v?.id)
            ?.map?.((themeColor, index) => {
              return (
                <ThemeRow
                  key={themeColor?.id as string}
                  themeColor={themeColor}
                  index={index}
                  selectedVariants={props.selectedVariants}
                  themingHex={props.themingHex}
                  defaultIconTheme={props.defaultIconTheme}
                  remappedSVG={props.remappedSVG}
                  onSelect={props.onSelect}
                  onNoTheme={props.onNoTheme}
                  appliedThemes={props.appliedThemes}
                />
              );
            })}
        </div>
      </div>
    </Container>
  );
};

export default React.memo(ThemeDefMatrix);
