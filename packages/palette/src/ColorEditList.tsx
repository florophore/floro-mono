import React, { useMemo, useCallback, useState, useEffect } from "react";
import { SchemaTypes, useFloroState, useQueryRef } from "./floro-schema-api";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorEditItem from "./ColorEditItem";

const AddColorLayout = styled.div`
  min-width: 642px;
`;

const AddColorContainer = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 576px;
`;

const ColorEditList = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [colors, setColors, isLoading, save] = useFloroState("$(palette).colors", [
    {
      id: "white",
      name: "White",
    },
    {
      id: "black",
      name: "Black",
    },
    {
      id: "red",
      name: "Red",
    },
    {
      id: "green",
      name: "Green",
    },
    {
      id: "blue",
      name: "Blue",
    },
  ]);

  const onReOrderColors = useCallback(
    (values: SchemaTypes["$(palette).colors"]) => setColors(values, false),
    []
  );

  const onRemove = useCallback(
    (color: SchemaTypes["$(palette).colors.id<?>"]) => {
      const values = colors?.filter((s) => s.id != color.id);
      if (values) {
        setColors(values, true);
      }
    },
    [colors]
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
    for (const { id } of colors ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, colors]);

  const onAppendNewColor = useCallback(() => {
    if (!newId || !newColorName || !canAddNewName || !colors) {
      return;
    }
    setColors([...colors, { id: newId, name: newColorName }], true);
    setNewColorName("");
  }, [newColorName, newId, canAddNewName, isLoading, colors]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      save();
    }
  }, [isDragging]);

  return (
    <AddColorLayout>
      <Reorder.Group
        axis="y"
        values={colors ?? []}
        onReorder={onReOrderColors}
        className={css(`
            padding: 24px 0px 0px 0px;
        `)}
      >
        <AnimatePresence>
          {colors?.map((color, index) => {
            return (
              <ColorEditItem
                key={color.id}
                color={color}
                index={index}
                onRemove={onRemove}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
      <AddColorContainer style={{marginLeft: 74}}>
        <Input
          value={newColorName}
          label={"add color"}
          placeholder={"color name"}
          onTextChanged={setNewColorName}
          width={200}
        />
        <Button
          onClick={onAppendNewColor}
          style={{ marginTop: 14 }}
          label={"add color"}
          bg={"purple"}
          size={"small"}
          isDisabled={!canAddNewName}
        />
      </AddColorContainer>
    </AddColorLayout>
  );
};

export default React.memo(ColorEditList);
