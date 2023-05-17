import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { PointerTypes, useReferencedObject } from "./floro-schema-api";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 0;
`;

const Circle = styled.div`
  height: 24px;
  width: 24px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 50%;
`;

const HexTitleWrapper = styled.div`
  width: 236px;
`;

const ButtonWrapper = styled.div`
  width: 140px;
  position: relative;
`;
const HexTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0 8px;
`;

interface Props {
  mappedColor: string;
  onChangeTheme: (originalColor: string) => void;
  onNoTheme: (originalColor: string) => void;
  appliedTheme?: PointerTypes["$(theme).themeColors.id<?>"];
  defaultTheme?: PointerTypes["$(theme).themes.id<?>"];
  hasMatchingThemeDef?: boolean;
}

const ThemeEditRow = (props: Props) => {
  const themedColor = useReferencedObject(props?.appliedTheme);
  const theme = useTheme();

  const onChangeTheme = useCallback(() => {
    props.onChangeTheme?.(props.mappedColor);
  }, [props.mappedColor, props.onChangeTheme]);

  const onNoTheme = useCallback(() => {
    props.onNoTheme?.(props.mappedColor);
  }, [props.mappedColor, props.onNoTheme]);

  return (
    <Container>
      <Circle style={{ backgroundColor: props.mappedColor }} />

      {!props.hasMatchingThemeDef && (
        <HexTitleWrapper>
            <HexTitle style={{ color: theme.colors.warningTextColor }}>
              {"No Related Theme Defs"}
            </HexTitle>
        </HexTitleWrapper>
      )}
      {props.hasMatchingThemeDef && (
        <>
          <HexTitleWrapper>
            {props.appliedTheme && <HexTitle>{themedColor?.name}</HexTitle>}
            {!props.appliedTheme && (
              <HexTitle style={{ color: ColorPalette.gray }}>
                {"No Theme Def Applied"}
              </HexTitle>
            )}
          </HexTitleWrapper>
          <ButtonWrapper>
            <Button
              onClick={onChangeTheme}
              label={!props.appliedTheme ? "apply def" : "change def"}
              bg={"purple"}
              size={"small"}
              textSize="small"
            />
          </ButtonWrapper>
          <ButtonWrapper>
            {props.appliedTheme && (
              <Button
                onClick={onNoTheme}
                style={{ width: 120 }}
                label={"undo apply"}
                bg={"gray"}
                size={"small"}
                textSize="small"
              />
            )}
          </ButtonWrapper>
        </>
      )}
    </Container>
  );
};

export default React.memo(ThemeEditRow);
