import React from "react";
import {
  PointerTypes,
  useFloroState,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import ColorRow from "./ColorRow";

const Container = styled.h1`
  padding: 0px;
  position: relative;
  max-height: 600px;
  overflow-y: scroll;
`;

interface Props {
  onSelect: (
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"],
    colorPaletteColorRef: PointerTypes["$(palette).colorPalettes.id<?>"],
  ) => void;
}

const ColorPaletteMatrix = (props: Props) => {
  const [colorPalettes] = useFloroState("$(palette).colorPalettes");
  return (
    <Container>
      <div style={{padding: 16}}>
        {colorPalettes
          ?.filter?.((v) => !!v?.id)
          ?.map?.((colorPalette, index) => {
            return (
              <ColorRow
                key={colorPalette?.id as string}
                colorPalette={colorPalette}
                index={index}
                onSelect={props.onSelect}
              />
            );
          })}
          <div style={{height: 240, width: '100%'}}></div>
      </div>
    </Container>
  );
};

export default React.memo(ColorPaletteMatrix);
