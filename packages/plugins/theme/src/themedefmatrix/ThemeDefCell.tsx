import React, { useCallback, useRef, useMemo, useState } from "react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useQueryRef,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import PalettePicker from "../colormatrix/PalettePicker";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const Wrapper = styled.div`
  position: relative;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 40px;
  margin-left: 24px;
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

const ColorDisplayCircle = styled.div`
  border: 2px solid;
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

const WarningCircle = styled.div`
  height: 72px;
  width: 72px;
  border-radius: 50%;
  margin-top: 8px;
  background: ${ColorPalette.white};
  position: relative;
  overflow: hidden;
  position: relative;
`;

const WarningIcon = styled.img`
  height: 72px;
  width: 72px;
`;

const AlphaColorCircle = styled.div`
  border: 0;
  outline: 0;
  appearance: none;
  height: 72px;
  width: 72px;
  position: absolute;
  background: #eee
    url('data:image/svg+xml,\
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"         fill-opacity=".25" >\
           <rect x="200" width="200" height="200" />\
           <rect y="200" width="200" height="200" />\
           </svg>');
  background-size: 72px 72px;
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

const getColorDistance = (staticHex: string, comparedHex: string) => {
  try {
    if (staticHex[0] != "#" || comparedHex[0] != "#") {
      return 0;
    }
    const r1 = parseInt((staticHex?.[1] ?? 'F') + (staticHex?.[2] ?? 'F'), 16);
    const r2 = parseInt((comparedHex?.[1] ?? 'F') + (comparedHex?.[2] ?? 'F'), 16);
    const g1 = parseInt((staticHex?.[3] ?? 'F') + (staticHex?.[4] ?? 'F'), 16);
    const g2 = parseInt((comparedHex?.[3] ?? 'F') + (comparedHex?.[4] ?? 'F'), 16);
    const b1 = parseInt((staticHex?.[5] ?? 'F') + (staticHex?.[6] ?? 'F'), 16);
    const b2 = parseInt((comparedHex?.[5] ?? 'F') + (comparedHex?.[6] ?? 'F'), 16);
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2))
  } catch (e) {
    return 0;
  }
}

interface Props {
  themeColor: SchemaTypes["$(theme).themeColors.id<?>"];
  themeObject: SchemaTypes["$(theme).themes.id<?>"];
  isReOrderMode: boolean;
}

const ThemeDefCell = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();
  const themeRef = useQueryRef("$(theme).themes.id<?>", props.themeObject.id);
  const colorCircle = useRef<HTMLDivElement>(null);

  const themeDefinitionRef = useQueryRef(
    "$(theme).themeColors.id<?>.themeDefinitions.id<?>",
    props.themeColor.id,
    themeRef
  );
  const [themeDefinition, setThemeDefinition] = useFloroState(
    themeDefinitionRef,
    {
      id: themeRef
    } as  SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'],
    false
  );

  const paletteColor = useReferencedObject(themeDefinition?.paletteColor);
  const paletteColorShade = useReferencedObject(themeDefinition?.paletteColorShade);
  const shade = useReferencedObject(paletteColorShade?.id);
  const [themeDefinitions] = useFloroState("$(theme).themeColors");

  const wasRemoved = useWasRemoved(themeDefinitionRef, false);
  const wasAdded = useWasAdded(themeDefinitionRef, false);
  const hasConflict = useHasConflict(themeDefinitionRef, false);
  const [showPicker, setShowPicker] = useState(false);

  const onShowPicker = useCallback(() => {
    setShowPicker(true);
  }, []);

  const onHidePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const contrastColor = useMemo(() => {
    if (!props.themeObject.backgroundColor) {
      if (theme.name == 'dark') {
        return ColorPalette.white;
      }
      return ColorPalette.mediumGray;
    }
    const lightDistance = getColorDistance(
      ColorPalette.white,
      props.themeObject.backgroundColor.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      props.themeObject.backgroundColor.hexcode
    );

    if (lightDistance <= darkDistance) {
      return ColorPalette.mediumGray;
    }
    return ColorPalette.white;
  }, [props.themeObject.backgroundColor, theme])

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
    return contrastColor;
    //return theme.colors.colorPaletteCard;
  }, [contrastColor, wasAdded, wasRemoved, wasRemoved, hasConflict, theme, commandMode]);

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
    if (!props.themeObject.backgroundColor) {
      if (theme.name == 'dark') {
        return EditDark;
      }
      return EditLight;
    }
    const lightDistance = getColorDistance(
      ColorPalette.white,
      props.themeObject.backgroundColor.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      props.themeObject.backgroundColor.hexcode
    );

    if (lightDistance <= darkDistance) {
      return EditLight;
    }
    return EditDark;
  }, [theme.name, props.themeObject.backgroundColor.hexcode]);

  const onSelect = useCallback((
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"],
    colorPaletteColorRef: PointerTypes["$(palette).colorPalettes.id<?>"],

    ) => {
    if (themeDefinition) {
      setThemeDefinition({
        ...themeDefinition,
        paletteColor: colorPaletteColorRef,
        paletteColorShade: colorPaletteColorShadeRef,
      }, true)
    }
  }, [themeDefinition, themeDefinitions]);

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const title = useMemo(() => {
    if (!paletteColor?.name || !shade?.name) {
      return null;
    }
    return shade?.name + " " + paletteColor?.name;
  }, [paletteColor?.name, shade?.name])

  return (
    <Wrapper>
      <Container>
        <Card
          style={{
            borderColor: cardBorderColor,
            background: props.themeObject.backgroundColor.hexcode,
          }}
        >
          <CardInterior>
            {!!paletteColorShade && (
              <>
                <ColorDisplayCircle style={{ borderColor: contrastColor }}>
                    {paletteColorShade?.hexcode && (
                      <ColorCircle
                        ref={colorCircle}
                        style={{ background: paletteColorShade?.hexcode }}
                      />
                    )}
                    {!paletteColorShade?.hexcode && (
                      <AlphaColorCircle />
                    )}
                </ColorDisplayCircle>
              </>
            )}
            {!paletteColorShade && (
              <WarningCircle>
                <WarningIcon src={warningIcon}/>

              </WarningCircle>
            )}
          </CardInterior>

          {commandMode == "edit" && !props.isReOrderMode && (
            <EditIndicatorWrapper onClick={onShowPicker}>
              <EditIndicatorImg src={editIcon} />
            </EditIndicatorWrapper>
          )}
        </Card>
        {title && (
          <Title style={{ color: titleColor }}>{title}</Title>
        )}
        {!title && (
          <Title style={{ color: theme.colors.warningTextColor }}>{"missing color!"}</Title>
        )}
      </Container>
      <PalettePicker
        show={showPicker && commandMode == "edit" && !props.isReOrderMode}
        onDismiss={onHidePicker}
        onSelect={onSelect}
      />
    </Wrapper>
  );
};

export default React.memo(ThemeDefCell);
