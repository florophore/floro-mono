import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { SchemaTypes, getReferencedObject, makeQueryRef, useFloroContext, useFloroState, useIsFloroInvalid } from "../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ShadeEditItem from "./StateVariantEditItem";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import StateVariantEditItem from "./StateVariantEditItem";

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

const StateVariantEditList = () => {
  const theme = useTheme();
  const { applicationState } = useFloroContext();
  const [isDragging, setIsDragging] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [stateVariants, setStateVariants] = useFloroState("$(theme).stateVariants");

  const isInvalid = useIsFloroInvalid("$(theme).stateVariants");

  const onReOrderShades = useCallback(
    (values: SchemaTypes["$(theme).stateVariants"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef("$(theme).stateVariants.id<?>", v.id)
          );
        });
        setStateVariants(remap);
      }
    },
    [applicationState]
  );

  const onRemove = useCallback(
    (stateVariant: SchemaTypes["$(theme).stateVariants.id<?>"]) => {
      const values = stateVariants?.filter((s) => s.id != stateVariant.id);
      if (values) {
        setStateVariants(values);
      }
    },
    [stateVariants]
  );

  const newId = useMemo((): string | null => {
    if (!newVariantName || (newVariantName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newVariantName?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [newVariantName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of stateVariants ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, stateVariants]);

  const onAppendNewVariant = useCallback(() => {
    if (!newId || !newVariantName || !canAddNewName || !stateVariants) {
      return;
    }
    setStateVariants([...stateVariants, { id: newId, name: newVariantName }]);
    setNewVariantName("");
  }, [newVariantName, newId, canAddNewName, stateVariants]);

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
          <SectionTitle>{"State Variants"}</SectionTitle>
          {isInvalid && (
            <WarningIconImg src={warningIcon}/>
          )}
        </TitleRow>
      </TitleWrapper>
      <AnimatePresence>
        <AddShadeLayout>
          <Reorder.Group
            axis="y"
            values={stateVariants ?? []}
            onReorder={onReOrderShades}
            className={css(`
            padding: 24px 0px 0px 0px;
        `)}
          >
            <AnimatePresence>
              {stateVariants?.map((stateVariant, index) => {
                return (
                  <StateVariantEditItem
                    key={stateVariant.id}
                    stateVariant={stateVariant}
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
              value={newVariantName}
              label={"new variant"}
              placeholder={"variant name"}
              onTextChanged={setNewVariantName}
              width={200}
            />
            <Button
              onClick={onAppendNewVariant}
              style={{ marginTop: 14 }}
              label={"add variant"}
              bg={"orange"}
              size={"small"}
              textSize="small"
              isDisabled={!canAddNewName}
            />
          </AddShadeContainer>
        </AddShadeLayout>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(StateVariantEditList);
