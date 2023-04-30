import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  SchemaTypes,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useHasIndication,
  useIsFloroInvalid,
  useQueryRef,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import ExitLight from "@floro/common-assets/assets/images/icons/exit_icon.light.svg";
import ExitDark from "@floro/common-assets/assets/images/icons/exit_icon.dark.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 48px;
`;

const Card = styled.div`
  position: relative;
  height: 136px;
  width: 216px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.colorPaletteCard};
  border: 2px solid;
`;

const CardInterior = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 16px 0 0 0;
`;

const NoneText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;

const ColorDisplayCircle = styled.div`
  border: 2px solid ${ColorPalette.black};
  height: 72px;
  width: 72px;
  border-radius: 50%;
  margin-top: 8px;
  background: ${ColorPalette.white};
  position: relative;
  overflow: hidden;
  position: relative;
`;

const ColorCircle = styled.div`
  border: 0;
  outline: 0;
  appearance: none;
  height: 72px;
  width: 72px;
  position: absolute;
`;

const HiddenColorInput = styled.input`
    height: 32px;
    width: 32px;
    position: absolute;
    appearance: none;
    opacity: 0;
`

const ColorTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 4px 0 0 0;
`;

const EditIndicatorWrapper = styled.div`
  height: 32px;
  width: 32px;
  position: absolute;
  top: 4px;
  right: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
`;

const EditIndicatorImg = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;


const ExitIndicatorWrapper = styled.div`
  height: 32px;
  width: 32px;
  position: absolute;
  top: 4px;
  left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
`;

const ExitIndicatorImg = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;

interface Props {
  colorPalette: SchemaTypes["$(palette).colorPalettes.id<?>"];
  shade: SchemaTypes["$(palette).shades.id<?>"];
}

const ColorRow = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();
  const shadeRef = useQueryRef("$(palette).shades.id<?>", props.shade.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorCircle = useRef<HTMLDivElement>(null);
  const paletteCellRef = useQueryRef(
    "$(palette).colorPalettes.id<?>.colorShades.id<?>",
    props.colorPalette.id,
    shadeRef
  );
  const [paletteColor, setPaletteColor] = useFloroState(
    paletteCellRef,
    {
      id: shadeRef,
      hexcode: undefined,
      alpha: 0xff,
    },
    false
  );

  const wasRemoved = useWasRemoved(paletteCellRef, false);
  const wasAdded = useWasAdded(paletteCellRef, false);
  const hasConflict = useHasConflict(paletteCellRef, false);

  const [isEdittingHex, setIsEdittingHex] = useState(false);

  const cardBorderColor = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictBackground;
    }
    if (wasRemoved) {
      return theme.colors.removedBackground;
    }
    if (wasAdded) {
      return theme.colors.addedBackground;
    }
    return theme.colors.colorPaletteCard;
  }, [wasAdded, wasRemoved, wasRemoved, hasConflict, theme, commandMode]);

  const titleColor = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictBackground;
    }
    if (wasRemoved) {
      return theme.colors.removedBackground;
    }
    if (wasAdded) {
      return theme.colors.addedBackground;
    }
    return theme.colors.pluginTitle;
  }, [wasAdded, wasRemoved, wasRemoved, hasConflict, theme, commandMode]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const exitIcon = useMemo(() => {
    if (theme.name == "light") {
      return ExitLight;
    }
    return ExitDark;
  }, [theme.name]);

  const onShowEditor = useCallback(() => {
    setIsEdittingHex(true);
    if (inputRef?.current?.value && paletteColor) {
        setPaletteColor({
          ...paletteColor,
          hexcode: inputRef.current.value?.toUpperCase(),
        }, false);
    }
  }, [paletteColor]);

  const onUnsetColor = useCallback(() => {
    setIsEdittingHex(false);
    if (inputRef?.current?.value && paletteColor) {
        setPaletteColor({
          ...paletteColor,
          hexcode: undefined
        }, true);
    }
  }, [paletteColor]);

  const onBlurHiddenInput = useCallback(() => {
    if (inputRef?.current?.value && paletteColor) {
        setPaletteColor({
          ...paletteColor,
          hexcode: inputRef.current.value?.toUpperCase(),
        }, true);
    }
    setIsEdittingHex(false);
  }, [paletteColor])

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (paletteColor) {
        setPaletteColor({
          ...paletteColor,
          hexcode: event.target.value?.toUpperCase(),
        }, false);
    }
  }, [paletteColor])

  const showEditor = useMemo(() => {
    return commandMode == "edit";
  }, [commandMode])


  const isEditting = useMemo(() => {
    if (paletteColor?.hexcode || isEdittingHex) {
        return true;
    }
    return false;
  }, [commandMode, paletteColor?.hexcode, isEdittingHex])

  return (
    <Container>
      <Card style={{ borderColor: cardBorderColor }}>
        <CardInterior>
          {!isEditting && <NoneText>{"none"}</NoneText>}
          {isEditting && (
            <>
              <ColorDisplayCircle>
                <ColorCircle ref={colorCircle} style={{background: paletteColor?.hexcode ?? 'transparent'}} />
              </ColorDisplayCircle>
              <ColorTitle>{`${paletteColor?.hexcode}`}</ColorTitle>
            </>
          )}
        </CardInterior>
        {showEditor && (
            <EditIndicatorWrapper onClick={onShowEditor}>
                <EditIndicatorImg src={editIcon} />
                <HiddenColorInput ref={inputRef} onChange={onChange} onBlur={onBlurHiddenInput} type={'color'} defaultValue={paletteColor?.hexcode ?? '#000000'}/>
            </EditIndicatorWrapper>
        )}
        {isEditting && commandMode == "edit" && (
            <ExitIndicatorWrapper onClick={onUnsetColor}>
                <ExitIndicatorImg src={exitIcon}/>
            </ExitIndicatorWrapper>
        )}
      </Card>
      <Title style={{ color: titleColor }}>{props.shade.name}</Title>
    </Container>
  );
};

export default React.memo(ColorRow);
