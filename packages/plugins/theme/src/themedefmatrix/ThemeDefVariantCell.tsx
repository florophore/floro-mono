import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  extractQueryArgs,
  makeQueryRef,
  useExtractQueryArgs,
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

import PalettePicker from "../palettecolormatrix/PalettePicker";

import XCircleLight from "@floro/common-assets/assets/images/icons/x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/x_circle.dark.svg";
import OpacityPicker from "../OpacityPicker";

const Wrapper = styled.div`
  position: relative;
  margin-top: 29px;
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

const SubTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.1rem;
  text-align: left;
  padding: 0;
  margin: 0px 0 8px 0;
`;
const ColorTitle = styled.h6`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  padding: 0;
  margin: 8px 0 -8px 0;
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
const NoneText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
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

const AlphaWrapper = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
`;

const AlphaTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 0.8rem;
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
  variantDefinitionRef: PointerTypes["$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>"];
  isReOrderMode: boolean;
}

const ThemeDefVariantCell = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState } = useFloroContext();
  const [themeColorId, stateVariantRef, themeRef] = useExtractQueryArgs(props.variantDefinitionRef);
  const themeObject = useReferencedObject(themeRef);
  const stateVariant = useReferencedObject(stateVariantRef);
  const colorCircle = useRef<HTMLDivElement>(null);

  const [variantDefinition, setVariantDefinition] = useFloroState(
    props.variantDefinitionRef,
  );

  const paletteColorShade = useReferencedObject(variantDefinition?.paletteColorShade);
  const [paletteColorId, paletteShadeRef] = useExtractQueryArgs(variantDefinition?.paletteColorShade);
  const paletteColorRef = useQueryRef("$(palette).colorPalettes.id<?>", paletteColorId);
  const paletteColor = useReferencedObject(paletteColorRef);
  const shade = useReferencedObject(paletteShadeRef);
  const themeDefinitions = useReferencedObject("$(theme).themeColors");

  const wasRemoved = useWasRemoved(props.variantDefinitionRef, false);
  const wasAdded = useWasAdded(props.variantDefinitionRef, false);
  const hasConflict = useHasConflict(props.variantDefinitionRef, false);
  const [showPicker, setShowPicker] = useState(false);
  const [showOpacityPicker, setShowOpacityPicker] = useState(false);

  useEffect(() => {
    if (commandMode == "edit") {
      setShowPicker(false);
      setShowOpacityPicker(false);
    }

  }, [commandMode])

  const onShowPicker = useCallback(() => {
    setShowPicker(true);
  }, []);

  const onHidePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const onShowOpacityPicker = useCallback(() => {
    if (commandMode != "edit") {
      return;
    }
    setShowOpacityPicker(true);
  }, [commandMode]);

  const onHideOpacityPicker = useCallback(() => {
    setShowOpacityPicker(false);
  }, [])

  const contrastColor = useMemo(() => {
    if (!themeObject?.backgroundColor) {
      if (theme.name == 'dark') {
        return ColorPalette.white;
      }
      return ColorPalette.mediumGray;
    }
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject?.backgroundColor?.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject?.backgroundColor?.hexcode
    );

    if (lightDistance <= darkDistance) {
      return ColorPalette.mediumGray;
    }
    return ColorPalette.white;
  }, [themeObject?.backgroundColor, theme])

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
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject?.backgroundColor?.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject?.backgroundColor?.hexcode
    );
    if (hasConflict) {

      if (lightDistance <= darkDistance) {
        return ColorPalette.orange;
      }
      return ColorPalette.lightOrange;
    }
    if (wasRemoved) {
      if (lightDistance <= darkDistance) {
        return ColorPalette.red;
      }
      return ColorPalette.lightRed;
    }
    if (wasAdded) {
      if (lightDistance <= darkDistance) {
        return ColorPalette.teal;
      }
      return ColorPalette.lightTeal;
    }
      if (lightDistance <= darkDistance) {
        return ColorPalette.mediumGray;
      }
      return ColorPalette.white
  }, [wasAdded, wasRemoved, wasRemoved, hasConflict, theme, commandMode, themeObject?.backgroundColor?.hexcode]);


  const editIcon = useMemo(() => {
    if (!themeObject?.backgroundColor) {
      if (theme.name == 'dark') {
        return EditDark;
      }
      return EditLight;
    }
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject?.backgroundColor?.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject?.backgroundColor?.hexcode
    );

    if (lightDistance <= darkDistance) {
      return EditLight;
    }
    return EditDark;
  }, [theme.name, themeObject?.backgroundColor?.hexcode]);

  const onSelect = useCallback((
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
    ) => {
    if (variantDefinition) {
      setVariantDefinition({
        ...variantDefinition,
        paletteColorShade: colorPaletteColorShadeRef,
      })
    }
  }, [variantDefinition, setVariantDefinition]);

  const onUnsetColor = useCallback((
    ) => {
    if (variantDefinition) {
      setVariantDefinition({
        ...variantDefinition,
        paletteColorShade: undefined,
      })
    }
  }, [setVariantDefinition, applicationState]);

  const xIcon = useMemo(() => {
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject?.backgroundColor?.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject?.backgroundColor?.hexcode
    );

    if (lightDistance <= darkDistance) {
      return XCircleLight;
    }
    return XCircleDark;
  }, [theme.name]);

  const title = useMemo(() => {
    if (!paletteColor?.name || !shade?.name) {
      return null;
    }
    return shade?.name + " " + paletteColor?.name;
  }, [paletteColor?.name, shade?.name])

  const alphaPct = useMemo(() => {
    if (variantDefinition?.alpha !== null && variantDefinition?.alpha !== undefined) {
      return ((variantDefinition.alpha/255) * 100).toFixed(0) + '%';
    }
    return null;
  }, [variantDefinition?.alpha])

  const onChangeOpacity = useCallback(
    (alpha: number) => {
      if (variantDefinition) {
        setVariantDefinition(
          {
            ...variantDefinition,
            alpha,
          }
        );
      }
    },
    [variantDefinition, setVariantDefinition]
  );
  const hex = useMemo(() => {
    if (!paletteColorShade?.hexcode) {
      return '';
    }
    return (
      paletteColorShade?.hexcode +
      Math.round(variantDefinition?.alpha ?? 100)
        .toString(16)
        .padStart(2, "0")
    );
  }, [paletteColorShade?.hexcode, variantDefinition?.alpha]);

  return (
    <Wrapper>
      <Container>
        <Card
          style={{
            borderColor: cardBorderColor,
            background: themeObject?.backgroundColor?.hexcode ?? 'transparent',
          }}
        >
          <CardInterior>
            {!!paletteColorShade && (
              <>
                <ColorDisplayCircle style={{ borderColor: contrastColor,
                  background: themeObject?.backgroundColor.hexcode,
                 }}>
                    {paletteColorShade?.hexcode && (
                      <ColorCircle
                        ref={colorCircle}
                        style={{ background: hex }}
                      />
                    )}
                    {!paletteColorShade?.hexcode && (
                      <AlphaColorCircle />
                    )}
                </ColorDisplayCircle>

              </>
            )}
            {!paletteColorShade && (
              <NoneText style={{color: contrastColor}}>{
                'none'

              }</NoneText>
            )}
            {title && (
              <ColorTitle style={{ color: titleColor }}>{title}</ColorTitle>
            )}
          </CardInterior>

          {commandMode == "edit" && !props.isReOrderMode && (
            <EditIndicatorWrapper onClick={onShowPicker}>
              <EditIndicatorImg src={editIcon} />
            </EditIndicatorWrapper>
          )}

        {commandMode == "edit" && !props.isReOrderMode && !!paletteColorShade && (
            <ExitIndicatorWrapper onClick={onUnsetColor}>
                <ExitIndicatorImg src={xIcon}/>
            </ExitIndicatorWrapper>
        )}
          {!!paletteColorShade?.hexcode && (
            <AlphaWrapper
              style={{ cursor: commandMode == "edit" ? "pointer" : "default" }}
              onClick={onShowOpacityPicker}
            >
              <AlphaTitle style={{ color: contrastColor }}>
                {alphaPct}
              </AlphaTitle>
            </AlphaWrapper>
          )}
        </Card>
        <Title style={{ color: theme.colors.pluginTitle }}>{stateVariant?.name}</Title>
      </Container>
      <PalettePicker
        show={showPicker && commandMode == "edit" && !props.isReOrderMode}
        onDismiss={onHidePicker}
        onSelect={onSelect}
        isVariant
      />
      {!!paletteColorShade?.hexcode && themeObject?.backgroundColor?.hexcode && commandMode == "edit" && (
        <OpacityPicker
          show={showOpacityPicker}
          onDismiss={onHideOpacityPicker}
          alpha={variantDefinition?.alpha ?? 0}
          hexcode={paletteColorShade.hexcode}
          themeHex={themeObject?.backgroundColor?.hexcode}
          onChange={onChangeOpacity}
        />
      )}
    </Wrapper>
  );
};

export default React.memo(ThemeDefVariantCell);
