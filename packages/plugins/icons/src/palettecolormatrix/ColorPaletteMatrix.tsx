import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  PointerTypes,
  getReferencedObject,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import ColorRow from "./ColorRow";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  padding: 0px;
  position: relative;
  max-height: 100%;
  overflow-y: scroll;
`;

const AddColorInstructions = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.contrastText};
  padding: 16px 0px;
  margin: 0;
  max-width: 568px;
`;

const AddColorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const AddInfo = styled.div`
  position: sticky;
  width: 600px;
  left: 24px;
`;

interface Props {
  onSelect: (
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
  ) => void;
  filterNullHexes?: boolean;
  disabledNonNull?: boolean;
  show?: boolean;
}

const ColorPaletteMatrix = (props: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [newColorName, setNewColorName] = useState("");
  const [colorPalettes, setColorPalettes] = useFloroState("$(palette).colorPalettes")
  const newId = useMemo((): string | null => {
    if (!newColorName || (newColorName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newColorName?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [newColorName]);

  useEffect(() => {
    if (props.show) {
      if (container.current) {
        container.current.scrollTo(0, 0);
      }
    }
  }, [props.show])

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of colorPalettes ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, colorPalettes]);

  const onAppendNewColor = useCallback(() => {
    if (!newId || !newColorName || !canAddNewName || !colorPalettes) {
      return;
    }
    setColorPalettes(
      [{ id: newId, name: newColorName, colorShades: [] }, ...colorPalettes]
    );
    setNewColorName("");
  }, [newColorName, newId, canAddNewName, colorPalettes]);

  return (
    <Container ref={container}>
      {props.disabledNonNull && (
        <AddInfo>
          <AddColorInstructions>
            {'Click on a shade currently marked with "none" or add a new color row. Additional edits can be perform in the palette plugin.'}
          </AddColorInstructions>
          <AddColorContainer>
            <Input
              value={newColorName}
              label={"new color row"}
              placeholder={"color row name"}
              onTextChanged={setNewColorName}
              width={200}
              ref={input}
            />
            <Button
              onClick={onAppendNewColor}
              style={{ marginTop: 14, marginLeft: 24 }}
              label={"add color"}
              bg={"orange"}
              size={"small"}
              isDisabled={!canAddNewName}
            />
          </AddColorContainer>
        </AddInfo>
      )}
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
                filterNullHexes={props.filterNullHexes}
                disabledNonNull={props.disabledNonNull}
              />
            );
          })}
          <div style={{height: 240, width: '100%'}}></div>
      </div>
    </Container>
  );
};

export default React.memo(ColorPaletteMatrix);
