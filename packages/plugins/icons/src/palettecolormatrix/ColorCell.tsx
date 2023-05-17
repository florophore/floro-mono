import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  PointerTypes,
  SchemaTypes,
  useQueryRef,
  useReferencedObject,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Card = styled.div`
  position: relative;
  height: 96px;
  width: 136px;
  border-radius: 6px;
  background-color: ${(props) => props.theme.colors.colorPaletteCard};
  border: 2px solid ${(props) => props.theme.colors.colorPaletteCard};
  cursor: pointer;
  &:hover {
    border: 2px solid ${ColorPalette.linkBlue};
  }
`;

const CardWithoutHover = styled.div`
  position: relative;
  height: 96px;
  width: 136px;
  border-radius: 6px;
  background-color: ${(props) => props.theme.colors.colorPaletteCard};
  border: 2px solid ${(props) => props.theme.colors.colorPaletteCard};
  cursor: not-allowed;
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
  font-weight: 500;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 8px 0 0 0;
`;

const NoneText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;

const ColorDisplayCircle = styled.div`
  border: 2px solid ${ColorPalette.black};
  height: 56px;
  width: 56px;
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
  height: 56px;
  width: 56px;
  position: absolute;
`;

const ColorTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 0.8rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 4px 0 0 0;
`;

interface Props {
  colorPalette: SchemaTypes["$(palette).colorPalettes.id<?>"];
  shade: SchemaTypes["$(palette).shades.id<?>"];
  onSelect: (
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
  ) => void;
  filterNullHexes?: boolean;
  disabledNonNull?: boolean;
}

const ColorRow = (props: Props) => {
  const theme = useTheme();
  const shadeRef = useQueryRef("$(palette).shades.id<?>", props.shade.id);
  const paletteCellRef = useQueryRef(
    "$(palette).colorPalettes.id<?>.colorShades.id<?>",
    props.colorPalette.id,
    shadeRef
  );
  const paletteColor = useReferencedObject(paletteCellRef);
  const onSelect = useCallback(() => {
    if (paletteCellRef) {
      props.onSelect(paletteCellRef);
    }
  }, [paletteCellRef, props.onSelect]);
  return (
    <Container style={{ marginRight: 16 }}>
      {props.filterNullHexes && !paletteColor?.hexcode && (
        <CardWithoutHover>
          <CardInterior>
            <NoneText>{"none"}</NoneText>
          </CardInterior>
        </CardWithoutHover>
      )}
      {(!props.filterNullHexes || !!paletteColor?.hexcode) && (
        <>
          {!props.disabledNonNull && (
            <Card onClick={onSelect}>
              <CardInterior>
                {!paletteColor?.hexcode && !props.filterNullHexes && (
                  <NoneText>{"none"}</NoneText>
                )}
                {paletteColor?.hexcode && (
                  <>
                    <ColorDisplayCircle>
                      <ColorCircle
                        style={{
                          background: paletteColor?.hexcode ?? "transparent",
                        }}
                      />
                    </ColorDisplayCircle>
                    <ColorTitle>{`${paletteColor?.hexcode}`}</ColorTitle>
                  </>
                )}
              </CardInterior>
            </Card>
          )}
          {props.disabledNonNull && !!paletteColor?.hexcode && (
            <CardWithoutHover>
              <CardInterior>
                <ColorDisplayCircle>
                  <ColorCircle
                    style={{
                      background: paletteColor?.hexcode ?? "transparent",
                    }}
                  />
                </ColorDisplayCircle>
                <ColorTitle>{`${paletteColor?.hexcode}`}</ColorTitle>
              </CardInterior>
            </CardWithoutHover>
          )}
          {props.disabledNonNull && !paletteColor?.hexcode && (
            <Card onClick={onSelect}>
              <CardInterior>
                {!paletteColor?.hexcode && !props.filterNullHexes && (
                  <NoneText>{"none"}</NoneText>
                )}
                {paletteColor?.hexcode && (
                  <>
                    <ColorDisplayCircle>
                      <ColorCircle
                        style={{
                          background: paletteColor?.hexcode ?? "transparent",
                        }}
                      />
                    </ColorDisplayCircle>
                    <ColorTitle>{`${paletteColor?.hexcode}`}</ColorTitle>
                  </>
                )}
              </CardInterior>
            </Card>
          )}
        </>
      )}
      <Title style={{ color: theme.colors.pluginTitle }}>
        {props.shade.name}
      </Title>
    </Container>
  );
};

export default React.memo(ColorRow);
