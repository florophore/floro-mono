import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { SchemaTypes, getReferencedObject, makeQueryRef, useFloroContext, useFloroState, useIsFloroInvalid } from "../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ThemeEditItem from "./ThemeEditItem";

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
  width: 472px;
`;

const TitleTextWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
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
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 608px;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 16px;
  margin-top: 4px;
`;

const ThemeEditList = () => {
  const theme = useTheme();
  const { applicationState } = useFloroContext();
  const [isDragging, setIsDragging] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeColor, setNewThemeColor] = useState("#FFFFFF");
  const [themes, setThemes] = useFloroState("$(theme).themes", [], false);

  const isInvalid = useIsFloroInvalid("$(theme).themes");

  const onReOrderThemes = useCallback(
    (values: SchemaTypes["$(theme).themes"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef("$(theme).themes.id<?>", v.id)
          );
        });
        setThemes(remap);
      }
    },
    [applicationState]
  );

  const onRemove = useCallback(
    (shade: SchemaTypes["$(palette).shades.id<?>"]) => {
      const values = themes?.filter((s) => s.id != shade.id);
      if (values) {
        setThemes(values);
      }
    },
    [themes]
  );

  const newId = useMemo((): string | null => {
    if (!newThemeName || (newThemeName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newThemeName?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [newThemeName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of themes ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, themes]);

  const onAppendNewTheme = useCallback(() => {
    if (!newId || !newThemeName || !canAddNewName || !themes) {
      return;
    }
    setThemes([...themes, { id: newId, name: newThemeName, backgroundColor: {
      hexcode: newThemeColor,
    } }]);
    setNewThemeName("");
    setNewThemeColor("#FFFFFF");
  }, [newThemeName, newThemeColor, newId, canAddNewName, themes]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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
          <TitleTextWrapper>
            <SectionTitle>{"Themes"}</SectionTitle>
            {isInvalid && (
              <WarningIconImg src={warningIcon}/>
            )}
          </TitleTextWrapper>
        </TitleRow>
      </TitleWrapper>
      <AnimatePresence>
        <AddShadeLayout>
          <Reorder.Group
            axis="y"
            values={themes ?? []}
            onReorder={onReOrderThemes}
            className={css(`
            padding: 24px 0px 0px 0px;
        `)}
          >
            <AnimatePresence>
              {themes?.map((themeObject, index) => {
                return (
                  <ThemeEditItem
                    key={themeObject.id}
                    themeObject={themeObject}
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
              value={newThemeName}
              label={"new theme"}
              placeholder={"theme name"}
              onTextChanged={setNewThemeName}
              width={200}
            />
            <Button
              onClick={onAppendNewTheme}
              style={{ marginTop: 14 }}
              label={"add theme"}
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

export default React.memo(ThemeEditList);
