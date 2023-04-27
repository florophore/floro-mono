import React, { useEffect, useMemo } from "react";
import {
  PointerTypes,
  getReferencedObject,
  useFloroContext,
  useFloroState,
  useIsFloroInvalid,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import ColorRow from "./ColorRow";
import { SchemaTypes } from "../floro-schema-api";
import { makeQueryRef } from "../floro-schema-api";
import Button from "@floro/storybook/stories/design-system/Button";

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
  width: 460px;
`;

const ButtonContainer = styled.div`
  width: 260px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type DefaultPaletteMatrixValues = {
  [key in PointerTypes["$(palette).colors.id<?>"]]: {
    [key in PointerTypes["$(palette).shades.id<?>"]]: string | undefined;
  };
};

export const DEFAULT_PALETTE_VALUES: DefaultPaletteMatrixValues = {
  ["$(palette).colors.id<white>"]: {
    ["$(palette).shades.id<regular>"]: "#FFFFFF",
  },
  ["$(palette).colors.id<black>"]: {
    ["$(palette).shades.id<regular>"]: "#000000",
  },
  ["$(palette).colors.id<red>"]: {
    ["$(palette).shades.id<light>"]: "#F93D44",
    ["$(palette).shades.id<regular>"]: "#CC2F35",
    ["$(palette).shades.id<dark>"]: "#AA2227",
  },
  ["$(palette).colors.id<blue>"]: {
    ["$(palette).shades.id<light>"]: "#7E91EC",
    ["$(palette).shades.id<regular>"]: "#3D65DB",
    ["$(palette).shades.id<dark>"]: "#1F38B2",
  },
  ["$(palette).colors.id<green>"]: {
    ["$(palette).shades.id<light>"]: "#77F075",
    ["$(palette).shades.id<regular>"]: "#3DD43A",
    ["$(palette).shades.id<dark>"]: "#26A324",
  },
};

interface Props {
  showColorList: boolean;
  showShadeList: boolean;
  onHideColorList: () => void;
  onShowColorList: () => void;
  onHideShadeList: () => void;
  onShowShadeList: () => void;
}

const ColorPaletteMatrix = (props: Props) => {
  const { commandMode, applicationState } = useFloroContext();
  const [colors] = useFloroState("$(palette).colors", [], false);
  const [shades] = useFloroState("$(palette).shades", [], false);
  const shadesIsInvalid = useIsFloroInvalid("$(palette).shades");
  const colorsIsInvalid = useIsFloroInvalid("$(palette).colors");
  const defaultData = useMemo((): SchemaTypes["$(palette).palette"] => {
    return (
      colors?.map((color) => {
        const colorRef = makeQueryRef("$(palette).colors.id<?>", color.id);
        const paletteColors =
          shades?.map((shade) => {
            const shadeRef = makeQueryRef("$(palette).shades.id<?>", shade.id);
            return {
              id: shadeRef,
              hexcode: DEFAULT_PALETTE_VALUES?.[colorRef]?.[shadeRef],
              alpha: 100,
            };
          }) ?? [];
        return {
          id: colorRef,
          colors: paletteColors,
        };
      }) ?? []
    );
  }, [colors, shades]);

  const [,setPalette] = useFloroState(
    "$(palette).palette",
    defaultData,
    true
  );

  useEffect(() => {
    const nextPalette =
      colors?.map((color) => {
        const colorRef = makeQueryRef("$(palette).colors.id<?>", color.id);
        const paletteColors =
          shades?.map((shade) => {
            const shadeRef = makeQueryRef("$(palette).shades.id<?>", shade.id);
            const paletteColorRef = makeQueryRef(
              "$(palette).palette.id<?>.colors.id<?>",
              colorRef,
              shadeRef
            );
            if (applicationState) {
              const paletteColor = getReferencedObject(
                applicationState,
                paletteColorRef
              );
              if (paletteColor) {
                return {
                  id: shadeRef,
                  hexcode:
                    paletteColor?.hexcode ??
                    DEFAULT_PALETTE_VALUES?.[colorRef]?.[shadeRef],
                  alpha: 0xff,
                };
              }
            }
            return {
              id: shadeRef,
              hexcode: DEFAULT_PALETTE_VALUES?.[colorRef]?.[shadeRef],
              alpha: 0xff,
            };
          }) ?? [];
        return {
          id: colorRef,
          colors: paletteColors,
        };
      }) ?? [];
    setPalette(nextPalette, true);
  }, [colors, shades]);

  if ((colorsIsInvalid || shadesIsInvalid) && commandMode != "edit") {
    return null;
  }

  return (
    <div style={{ marginBottom: 36, marginRight: 72 }}>
      <TitleRow>
        <SectionTitle>{"Color Palette"}</SectionTitle>
        {commandMode == "edit" && (
          <ButtonContainer>
            {props.showColorList && (
              <Button
                label={"hide colors"}
                bg={"purple"}
                size={"small"}
                onClick={props.onHideColorList}
              />
            )}
            {!props.showColorList && (
              <Button
                label={"edit colors"}
                bg={"purple"}
                size={"small"}
                onClick={props.onShowColorList}
              />
            )}
            {props.showShadeList && (
              <Button
                label={"hide shades"}
                bg={"purple"}
                size={"small"}
                onClick={props.onHideShadeList}
              />
            )}
            {!props.showShadeList && (
              <Button
                label={"edit shades"}
                bg={"purple"}
                size={"small"}
                onClick={props.onShowShadeList}
              />
            )}
          </ButtonContainer>
        )}
      </TitleRow>
      {!colorsIsInvalid && !shadesIsInvalid && (
        <div style={{ marginBottom: 120 }}>
          {colors?.map((color) => {
            return <ColorRow key={color.id} color={color} />;
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(ColorPaletteMatrix);
