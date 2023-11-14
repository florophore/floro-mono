import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  PointerTypes,
  getReferencedObject,
  useFloroContext,
  useFloroState,
  useIsFloroInvalid,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import ColorRow from "./ColorRow";
import { css } from "@emotion/css";
import { SchemaTypes } from "../floro-schema-api";
import { makeQueryRef } from "../floro-schema-api";
import Button from "@floro/storybook/stories/design-system/Button";
import { AnimatePresence, Reorder } from "framer-motion";
import ColorPalette from "@floro/styles/ColorPalette";
import Input from "@floro/storybook/stories/design-system/Input";

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
  width: 608px;
`;

const SubTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SubTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 0;
`;

const ButtonContainer = styled.div`
  width: 256px;
`;
const AddColorContainer = styled.div`
  margin: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 568px;
`;

interface Props {
  showShadeList: boolean;
  onHideShadeList: () => void;
  onShowShadeList: () => void;
  onScrollToBottom: () => void;
}

const ColorPaletteMatrix = (props: Props) => {
  const { commandMode, applicationState } = useFloroContext();
  const input = useRef<HTMLInputElement>(null);

  const [colorPalettes, setColorPalettes, save] = useFloroState("$(palette).colorPalettes")

  const [isDragging, setIsDragging] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onReOrderColors = useCallback(
    (values: SchemaTypes["$(palette).colorPalettes"]) => {
      setColorPalettes(values, false);
    },
    [setColorPalettes]
  );

  const onRemove = useCallback(
    (shade: SchemaTypes["$(palette).colorPalettes.id<?>"]) => {
      const values = colorPalettes?.filter((s) => s.id != shade.id);
      if (values) {
        setColorPalettes(values);
      }
    },
    [colorPalettes]
  );

  const newId = useMemo((): string | null => {
    if (!newColorName || (newColorName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newColorName?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [newColorName]);

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
      [{ id: newId, name: newColorName, colorShades: [] }, ...colorPalettes],
    );
    setNewColorName("");
  }, [newColorName, newId, canAddNewName, colorPalettes]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    save();
    setIsDragging(false);
  }, [save]);

  const onOrganize = useCallback(() => {
    setIsReOrderMode(true);
  }, []);

  const onEdit = useCallback(() => {
    setIsReOrderMode(false);
  }, []);


  return (
    <div style={{ marginBottom: 36, marginRight: 72 }}>
      <TitleRow>
        <SectionTitle>{"Color Palette"}</SectionTitle>
        {commandMode == "edit" && (
          <ButtonContainer>
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
      {commandMode == "edit" && (
        <SubTitleRow>
          {isReOrderMode && (
            <SubTitle onClick={onEdit}>{"done organizing"}</SubTitle>
          )}
          {!isReOrderMode && (
            <SubTitle onClick={onOrganize}>{"organize colors"}</SubTitle>
          )}
        </SubTitleRow>
      )}
      {!isReOrderMode && commandMode == "edit" && (
        <AddColorContainer style={{ marginLeft: 40 }}>
          <Input
            value={newColorName}
            label={"new color"}
            placeholder={"color name"}
            onTextChanged={setNewColorName}
            width={200}
            ref={input}
          />
          <Button
            onClick={onAppendNewColor}
            style={{ marginTop: 14 }}
            label={"add color"}
            bg={"orange"}
            size={"small"}
            isDisabled={!canAddNewName}
          />
        </AddColorContainer>
      )}
      <div style={{ marginBottom: 120 }}>
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={colorPalettes ?? []}
            onReorder={onReOrderColors}
          >
            {colorPalettes?.filter?.(v => !!v?.id)?.map?.((colorPalette, index) => {
              return (
                <ColorRow
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onRemove={onRemove}
                  key={colorPalette?.id as string}
                  colorPalette={colorPalette}
                  index={index}
                  isDragging={isDragging}
                  isReOrderMode={isReOrderMode}
                />
              );
            })}
          </Reorder.Group>
          </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(ColorPaletteMatrix);
