import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { PointerTypes, getReferencedObject, useExtractQueryArgs, useFloroContext, useQueryRef, useReferencedObject } from "./floro-schema-api";
import CrossRed from "@floro/common-assets/assets/images/icons/x_cross.red.svg";
import CrossLightRed from "@floro/common-assets/assets/images/icons/x_cross.red.svg";
import CheckPurple from "@floro/common-assets/assets/images/icons/check.purple.svg";
import CheckLightPurple from "@floro/common-assets/assets/images/icons/check.light_purple.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import PalettePicker from "./palettecolormatrix/PalettePicker";

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
  width: 104px;
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

const PaletteTextWrapper = styled.div`
  width: 192px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const InPaletteText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.inPaletteText};
  padding: 0 8px;
`;

const NotInPaletteText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.notInPaletteText};
  padding: 0 8px;
`;

const PaletteCheckIcon = styled.img`
  width: 16px;
  height: 16px;
`;


interface Props {
  originalColor: string;
  color: string;
  paletteShadeRef?: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"];
  onUndoRemap: (originalColor: string) => void;
  onEditColor: (originalColor: string) => void;
  onAddHex: (originalColor: string) => void;
  onUndoAdd: (originalColor: string) => void;
  wasAdded?: boolean;
}

const ColorEditRow = (props: Props) => {
  const theme = useTheme();
  const colorPalettes = useReferencedObject("$(palette).colorPalettes") ?? [];

  const paletteColor = useReferencedObject(props.paletteShadeRef);
  const [colorId] = useExtractQueryArgs(props.paletteShadeRef);
  const colorRef = useQueryRef("$(palette).colorPalettes.id<?>", colorId);
  const color = useReferencedObject(colorRef)
  const shade = useReferencedObject(paletteColor?.id);

  const paletteHexes = useMemo(() => {
    return colorPalettes
      .flatMap((c) => {
        return c.colorShades.map((s) => {
          return s.hexcode ?? null;
        });
      })
      ?.filter((v: string | null) => {
        return !!v;
      });
  }, [colorPalettes]);

  const isInPalette = useMemo(() => {
    return paletteHexes.includes(props?.color?.substring?.(0, 7) ?? "");
  }, [paletteHexes, props.color]);

  const colorTitle = useMemo(
    () =>
      props?.color?.substring(0, 7) ?? props?.originalColor?.substring(0, 7),
    [props.color, props.originalColor]
  );

  const paletteCheckIcon = useMemo(() => {
    if (isInPalette) {
      if (theme.name == "light") {
        return CheckPurple;
      }
      return CheckLightPurple;
    }
    if (theme.name == "light") {
      return CrossRed;
    }
    return CrossLightRed;
  }, [isInPalette, theme.name]);

  const onUndoRemap = useCallback(() => {
    props.onUndoRemap?.(props.originalColor);
  }, [props.originalColor, props.onUndoRemap])

  const onEditColor = useCallback(() => {
    props.onEditColor?.(props.originalColor);
  }, [props.originalColor, props.onEditColor])

  const onAddHex = useCallback(() => {
    props.onAddHex?.(props.originalColor);
  }, [props.originalColor, props.onAddHex])

  const onUndoAdd = useCallback(() => {
    props.onUndoAdd?.(props.originalColor);
  }, [props.originalColor, props.onUndoAdd])

  return (
    <Container>
      <Circle style={{ backgroundColor: props.color }} />
      <HexTitleWrapper>
        <HexTitle>{colorTitle}</HexTitle>
      </HexTitleWrapper>
      <PaletteTextWrapper>
        <PaletteCheckIcon src={paletteCheckIcon} />
        {isInPalette && <InPaletteText>{color?.name + "/" + shade?.name}</InPaletteText>}
        {!isInPalette && (
          <NotInPaletteText>{"not in palette"}</NotInPaletteText>
        )}
      </PaletteTextWrapper>
      <ButtonWrapper>
        <Button
          onClick={onEditColor}
          label={"change color"}
          bg={"purple"}
          size={"small"}
          textSize="small"
        />
      </ButtonWrapper>
      <ButtonWrapper>
        {!isInPalette && (
          <Button
            onClick={onAddHex}
            style={{ width: 120 }}
            label={"add to palette"}
            bg={"teal"}
            size={"small"}
            textSize="small"
          />
        )}
        {props.originalColor == props.color && props.wasAdded && (
          <Button
            onClick={onUndoAdd}
            style={{ width: 120 }}
            label={"revert add"}
            bg={"gray"}
            size={"small"}
            textSize="small"
          />
        )}
        {!!paletteColor && props.originalColor != paletteColor?.hexcode + 'FF' && (
          <Button
            onClick={onUndoRemap}
            style={{ width: 120 }}
            label={"undo mapping"}
            bg={"orange"}
            size={"small"}
            textSize="small"
          />
        )}
      </ButtonWrapper>
    </Container>
  );
};

export default React.memo(ColorEditRow);
