import React, { useCallback, useRef, useMemo, useState } from "react";
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
import { replaceHexIndicesInSvg, rethemeSvg } from "../colorhooks";

const Wrapper = styled.div`
  position: relative;
  margin-top: 29px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  margin-bottom: 8px;
  margin-right: 16px;
`;

const Card = styled.div`
  position: relative;
  height: 96px;
  width: 136px;
  border-radius: 8px;
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
  font-size: 1rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
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
  font-size: 1.1rem;
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
const IconWrapper = styled.div`
  height: 72px;
  width: 72px;
`;

const Icon = styled.img`
  max-height: 72px;
  max-width: 72px;
  width: 100%;
  height: 100%;
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

const getColorDistance = (staticHex: string, comparedHex: string) => {
  try {
    if (staticHex[0] != "#" || comparedHex[0] != "#") {
      return 0;
    }
    const r1 = parseInt((staticHex?.[1] ?? "F") + (staticHex?.[2] ?? "F"), 16);
    const r2 = parseInt(
      (comparedHex?.[1] ?? "F") + (comparedHex?.[2] ?? "F"),
      16
    );
    const g1 = parseInt((staticHex?.[3] ?? "F") + (staticHex?.[4] ?? "F"), 16);
    const g2 = parseInt(
      (comparedHex?.[3] ?? "F") + (comparedHex?.[4] ?? "F"),
      16
    );
    const b1 = parseInt((staticHex?.[5] ?? "F") + (staticHex?.[6] ?? "F"), 16);
    const b2 = parseInt(
      (comparedHex?.[5] ?? "F") + (comparedHex?.[6] ?? "F"),
      16
    );
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
  } catch (e) {
    return 0;
  }
};

interface Props {
  variantDefinitionRef: PointerTypes["$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>"];
  remappedSVG?: string;
  themingHex?: string;
  defaultIconTheme: string;
  selectedVariants?: { [key: string]: boolean };
  appliedThemes?: { [key: string]: PointerTypes["$(theme).themeColors.id<?>"] };
}

const ThemeDefVariantCell = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState } = useFloroContext();
  const [themeColorId, stateVariantRef, themeRef] = useExtractQueryArgs(
    props.variantDefinitionRef
  );

  const themeColorRef = useQueryRef("$(theme).themeColors.id<?>", themeColorId);
  const themeObject = useReferencedObject(themeRef);
  const stateVariant = useReferencedObject(stateVariantRef);

  const variantDefinition = useReferencedObject(
    props.variantDefinitionRef
  );

  const wasRemoved = useWasRemoved(props.variantDefinitionRef, false);
  const wasAdded = useWasAdded(props.variantDefinitionRef, false);
  const hasConflict = useHasConflict(props.variantDefinitionRef, false);

  const contrastColor = useMemo(() => {
    if (!themeObject?.backgroundColor) {
      if (theme.name == "dark") {
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
      themeObject.backgroundColor.hexcode
    );

    if (lightDistance <= darkDistance) {
      return ColorPalette.mediumGray;
    }
    return ColorPalette.white;
  }, [themeObject.backgroundColor, theme]);

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
  }, [
    contrastColor,
    wasAdded,
    wasRemoved,
    wasRemoved,
    hasConflict,
    theme,
    commandMode,
  ]);

  const variantSvg = useMemo(() => {
    if (!applicationState || !props.remappedSVG) {
      return props.remappedSVG ?? "";
    }
    return rethemeSvg(
      applicationState,
      props.remappedSVG,
      props.appliedThemes ?? {},
      themeRef,
      themeColorRef,
      props.themingHex,
      stateVariantRef,
      variantDefinition?.alpha ?? 255
    ) ?? "";
  }, [
    applicationState,
    props.remappedSVG,
    props.appliedThemes,
    themeRef,
    themeColorRef,
    stateVariantRef,
    props.themingHex,
    variantDefinition?.alpha
  ]);

  const remappedSVGUrl = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(variantSvg ?? "")}`;
  }, [variantSvg]);

  return (
    <Wrapper>
      <Container>
        <Card
          style={{
            borderColor: cardBorderColor,
            background: themeObject.backgroundColor.hexcode,
          }}
        >
          <CardInterior>
            <IconWrapper>
              <Icon src={remappedSVGUrl} />
            </IconWrapper>
          </CardInterior>
        </Card>
        <Title style={{ color: theme.colors.pluginTitle }}>
          {stateVariant?.name}
        </Title>
      </Container>
    </Wrapper>
  );
};

export default React.memo(ThemeDefVariantCell);
