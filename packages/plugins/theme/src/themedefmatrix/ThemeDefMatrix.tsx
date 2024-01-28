import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useIsFloroInvalid,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { SchemaTypes } from "../floro-schema-api";
import Button from "@floro/storybook/stories/design-system/Button";
import { AnimatePresence, Reorder } from "framer-motion";
import ColorPalette from "@floro/styles/ColorPalette";
import Input from "@floro/storybook/stories/design-system/Input";
import ThemeRow from "./ThemeRow";
import ThemeDefCell from "./ThemeDefCell";

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
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 568px;
`;

interface Props {
  showThemeList: boolean;
  onHideThemeList: () => void;
  onShowThemeList: () => void;
  showVariantList: boolean;
  onHideVariantList: () => void;
  onShowVariantList: () => void;
  onScrollToBottom: () => void;
}

const ThemeDefMatrix = (props: Props) => {
  const { commandMode, applicationState } = useFloroContext();
  const input = useRef<HTMLInputElement>(null);

  const [themeColors, setThemeColors] = useFloroState("$(theme).themeColors");

  const [isDragging, setIsDragging] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onReOrderThemeColors = useCallback(
    (values: SchemaTypes["$(theme).themeColors"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
            return getReferencedObject(
              applicationState,
              makeQueryRef("$(theme).themeColors.id<?>", v.id)
            );
          });
        setThemeColors(remap);
      }
    },
    [setThemeColors, applicationState]
  );

  const onRemove = useCallback(
    (shade: SchemaTypes["$(theme).themeColors.id<?>"]) => {
      const values = applicationState?.theme?.themeColors?.filter((s) => s.id != shade.id);
      if (values) {
        setThemeColors(values);
      }
    },
    [setThemeColors, applicationState?.theme?.themeColors]
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
    for (const { id } of themeColors ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, themeColors]);

  const onAppendNewColor = useCallback(() => {
    if (!applicationState) {
      return;
    }
    const themeColors = getReferencedObject(applicationState, "$(theme).themeColors");
    if (!newId || !newColorName || !canAddNewName || !themeColors) {
      return;
    }
    setThemeColors(
      [
        {
          id: newId,
          name: newColorName,
          includeVariants: false,
          themeDefinitions: [],
          variants: [],
        },
        ...themeColors,
      ],
    );
    setNewColorName("");
  }, [applicationState, setThemeColors, newColorName, newId, canAddNewName, themeColors]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onOrganize = useCallback(() => {
    setIsReOrderMode(true);
  }, []);

  const onEdit = useCallback(() => {
    setIsReOrderMode(false);
  }, []);

  return (
    <div style={{ marginBottom: 36, marginRight: 72 }}>
      <TitleRow>
        <SectionTitle>{"Theme Color Definitions"}</SectionTitle>
        {commandMode == "edit" && (
          <ButtonContainer>
            {props.showThemeList && (
              <Button
                label={"hide themes"}
                bg={"purple"}
                size={"small"}
                textSize="small"
                onClick={props.onHideThemeList}
              />
            )}
            {!props.showThemeList && (
              <Button
                label={"edit themes"}
                bg={"purple"}
                size={"small"}
                textSize="small"
                onClick={props.onShowThemeList}
                isDisabled={props.showVariantList}
              />
            )}
            {!props.showVariantList && (
              <Button
                style={{
                  marginLeft: 16,
                }}
                label={"edit variants"}
                bg={"teal"}
                size={"small"}
                textSize="small"
                onClick={props.onShowVariantList}
                isDisabled={props.showThemeList}
              />
            )}
            {props.showVariantList && (
              <Button
                style={{
                  marginLeft: 16,
                }}
                label={"hide variants"}
                bg={"teal"}
                size={"small"}
                textSize="small"
                onClick={props.onHideVariantList}
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
            <SubTitle onClick={onOrganize}>{"organize definitions"}</SubTitle>
          )}
        </SubTitleRow>
      )}
      {!isReOrderMode && commandMode == "edit" && (
        <AddColorContainer style={{ marginLeft: 40 }}>
          <Input
            value={newColorName}
            label={"new theme definition"}
            placeholder={"definition name"}
            onTextChanged={setNewColorName}
            width={200}
            ref={input}
          />
          <Button
            onClick={onAppendNewColor}
            style={{ marginTop: 14 }}
            label={"add def"}
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
            values={themeColors ?? []}
            onReorder={onReOrderThemeColors}
          >
            {themeColors
              ?.filter?.((v) => !!v?.id)
              ?.map?.((themeColor, index) => {
                return (
                  <ThemeRow
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onRemove={onRemove}
                    key={themeColor?.id as string}
                    themeColor={themeColor}
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

export default React.memo(ThemeDefMatrix);
