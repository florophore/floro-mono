import React, { useMemo, useCallback, useState, useEffect } from "react";
import { SchemaTypes, useFloroState } from "./floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ShadeEditItem from "./ShadeEditItem";

const AddShadeLayout = styled.div`
  min-width: 642px;
`;

const AddShadeContainer = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 576px;
`;

const ShadeEditList = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [newShadeName, setNewShadeName] = useState("");
  const [shades, setShades, isLoading, save] = useFloroState(
    "$(palette).shades",
    [
      {
        id: "light",
        name: "Light",
      },
      {
        id: "regular",
        name: "Regular",
      },
      {
        id: "dark",
        name: "Dark",
      },
    ]
  );

  const onReOrderShades = useCallback(
    (values: SchemaTypes["$(palette).shades"]) => setShades(values, false),
    []
  );

  const onRemove = useCallback(
    (shade: SchemaTypes["$(palette).shades.id<?>"]) => {
      const values = shades?.filter((s) => s.id != shade.id);
      if (values) {
        setShades(values, true);
      }
    },
    [shades]
  );

  const newId = useMemo((): string | null => {
    if (!newShadeName || (newShadeName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newShadeName?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [newShadeName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of shades ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, shades]);

  const onAppendNewShade = useCallback(() => {
    if (!newId || !newShadeName || !canAddNewName || !shades) {
      return;
    }
    setShades([...shades, { id: newId, name: newShadeName }], true);
    setNewShadeName("");
  }, [newShadeName, newId, canAddNewName, isLoading, shades]);

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
    <AnimatePresence>
      <AddShadeLayout>
        <Reorder.Group
          axis="y"
          values={shades ?? []}
          onReorder={onReOrderShades}
          className={css(`
            padding: 24px 0px 0px 0px;
        `)}
        >
          <AnimatePresence>
            {shades?.map((shade, index) => {
              return (
                <ShadeEditItem
                  key={shade.id}
                  shade={shade}
                  index={index}
                  onRemove={onRemove}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
        <AddShadeContainer style={{ marginLeft: 74 }}>
          <Input
            value={newShadeName}
            label={"add shade"}
            placeholder={"shade name"}
            onTextChanged={setNewShadeName}
            width={200}
          />
          <Button
            onClick={onAppendNewShade}
            style={{ marginTop: 14 }}
            label={"add shade"}
            bg={"purple"}
            size={"small"}
            isDisabled={!canAddNewName}
          />
        </AddShadeContainer>
      </AddShadeLayout>
    </AnimatePresence>
  );
};

export default React.memo(ShadeEditList);
