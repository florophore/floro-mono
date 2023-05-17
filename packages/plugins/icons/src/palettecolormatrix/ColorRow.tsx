import React, { useMemo } from "react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroState,
  useIsFloroInvalid,
  useQueryRef,
  useReferencedObject,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorCell from "./ColorCell";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 8px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  width: 484px;
  left: 24px;
`;

interface Props {
  colorPalette: SchemaTypes["$(palette).colorPalettes.id<?>"];
  index: number;
  onSelect: (
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
  ) => void;
  filterNullHexes?: boolean;
  disabledNonNull?: boolean;
}

const ColorRow = (props: Props) => {

  const theme = useTheme();
  const colorPaletteRef = useQueryRef(
    "$(palette).colorPalettes.id<?>",
    props.colorPalette.id
  );
  const isInvalid = useIsFloroInvalid(colorPaletteRef, false);
  const title = useMemo(
    () => (isInvalid ? props.colorPalette.id : props.colorPalette.name),
    [isInvalid, props.colorPalette]
  );

  const shades = useReferencedObject("$(palette).shades");

  return (
    <Container>
      <TitleRow>
        <RowTitle style={{ color: theme.colors.contrastText }}>{title}</RowTitle>
      </TitleRow>
      <div>
        <RowWrapper>
          <Row>
            {shades?.map((shade, index) => {
              return (
                <ColorCell
                  key={shade.id}
                  shade={shade}
                  colorPalette={props.colorPalette}
                  onSelect={props.onSelect}
                  filterNullHexes={props.filterNullHexes}
                  disabledNonNull={props.disabledNonNull}
                />
              );
            })}
          </Row>
        </RowWrapper>
      </div>
    </Container>
  );
};

export default React.memo(ColorRow);
