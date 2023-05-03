import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { SchemaTypes, getReferencedObject, makeQueryRef, useFloroContext, useFloroState, useIsFloroInvalid } from "../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ShadeEditItem from "./ShadeEditItem";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const AddShadeLayout = styled.div`
  min-width: 642px;
`;

const AddShadeContainer = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 568px;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 650px;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 16px;
  margin-top: 4px;
`;

const ShadeEditList = () => {
  const theme = useTheme();
  const { applicationState } = useFloroContext();
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

  const isInvalid = useIsFloroInvalid("$(palette).shades");

  const onReOrderShades = useCallback(
    (values: SchemaTypes["$(palette).shades"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef("$(palette).shades.id<?>", v.id)
          );
        });
        setShades(remap, false);
      }
    },
    [applicationState]
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

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name])

  return (
    <div style={{marginBottom: 36}}>
      <TitleWrapper>
        <TitleRow>
          <SectionTitle>{"Shades"}</SectionTitle>
          {isInvalid && (
            <WarningIconImg src={warningIcon}/>
          )}
        </TitleRow>
      </TitleWrapper>
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
          <AddShadeContainer style={{ marginLeft: 40 }}>
            <Input
              value={newShadeName}
              label={"new shade"}
              placeholder={"shade name"}
              onTextChanged={setNewShadeName}
              width={200}
            />
            <Button
              onClick={onAppendNewShade}
              style={{ marginTop: 14 }}
              label={"add shade"}
              bg={"orange"}
              size={"small"}
              isDisabled={!canAddNewName}
            />
          </AddShadeContainer>
        </AddShadeLayout>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ShadeEditList);
