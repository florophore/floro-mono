import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { SchemaTypes, getReferencedObject, useCopyApi, useFloroContext, useHasIndication, useQueryRef, useReferencedObject } from "../floro-schema-api";
import {  Reorder, useDragControls } from "framer-motion";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import UpdateLocaleModal from "./UpdateLocaleModal";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { useDiffColor } from "../diff";

const Container = styled.div`
    max-width: 666px;
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-bottom: 24px;
`;

const LeftColumn = styled.div`
    width: 40px;
    margin-right: 24px;
`;

const RightColumn = styled.div`
    max-width: 666px;
    width: 100%;
    border-radius: 8px;
    border: 2px solid ${props => props.theme.colors.inputBorderColor};
    background: ${props => props.theme.background};
    display: flex;
    flex-direction: column;
    padding: 16px;
`;

const DragControlBox = styled.div`
    display: flex;
    height: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const LocaleTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  text-align: center;
  padding: 0;
  margin: 0;
`;

const SubPropTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  text-align: center;
  padding: 0;
  margin: 0;
`;

const SubPropValue = styled.h4`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.contrastText};
  text-align: center;
  padding: 0;
  margin: 0 12px 0 12px;
`;

const DefaultTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 0 16px 0 16px;
`;

const Icon = styled.img`
  height: 28px;
  width: 28px;
  cursor: pointer;
`;

const PinPhrase = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;


interface Props {
    locale: SchemaTypes['$(text).localeSettings.locales.localeCode<?>'];
    index: number;
    onRemove: (localeCode: string) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}
const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

const LocaleBox = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState, isCopyMode } = useFloroContext();
  const localeSettings = useReferencedObject("$(text).localeSettings");
  const defaultLocale = useReferencedObject(localeSettings.defaultLocaleRef);
  const controls = useDragControls();
  const [showUpdate, setShowUpdate] = useState(false);

  const onShowUpdate = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const onHideUpdate = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const onRemove = useCallback(() => {
    props.onRemove(props.locale.localeCode);
  }, [props.onRemove, props.locale?.localeCode]);

  const localeRef = useQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props?.locale?.localeCode
  );

  const {isCopied, toggleCopy} = useCopyApi(localeRef);

  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event);
    },
    [controls]
  );

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const translateFromLocale = useMemo(() => {
    if (!props.locale.defaultTranslateFromLocaleRef || !applicationState) {
      if (localeSettings.defaultLocaleRef != localeRef && applicationState) {
        const translateFrom = getReferencedObject(
          applicationState,
          localeSettings.defaultLocaleRef
        );
        return `None/${translateFrom.name} (${translateFrom.localeCode})`;
      }
      return "None";
    }
    const translateFrom = getReferencedObject(
      applicationState,
      props.locale.defaultTranslateFromLocaleRef
    );
    return `${translateFrom.name} (${translateFrom.localeCode})`;
  }, [
    applicationState,
    props.locale.defaultTranslateFromLocaleRef,
    localeSettings?.defaultLocaleRef,
    localeRef,
  ]);

  const fallbackLocale = useMemo(() => {
    if (!props.locale.defaultFallbackLocaleRef || !applicationState) {
      if (localeSettings.defaultLocaleRef != localeRef && applicationState) {
        const fallback = getReferencedObject(
          applicationState,
          localeSettings.defaultLocaleRef
        );
        return `None/${fallback.name} (${fallback.localeCode})`;
      }
      return "None";
    }
    const fallback = getReferencedObject(
      applicationState,
      props.locale.defaultFallbackLocaleRef
    );
    return `${fallback.name} (${fallback.localeCode})`;
  }, [
    applicationState,
    props.locale.defaultFallbackLocaleRef,
    localeSettings?.defaultLocaleRef,
  ]);

  const diffColor = useDiffColor(localeRef, true, 'lighter');
  const localesHasIndication = useHasIndication(localeRef);

  const container = (
    <>
      <UpdateLocaleModal
        show={showUpdate && commandMode == "edit"}
        onDismiss={onHideUpdate}
        locale={props.locale}
      />
      <Container>
        {commandMode == "edit" && (
          <LeftColumn>
            <DragControlBox onPointerDown={onPointerDown}>
              <DragIcon src={draggerIcon} />
            </DragControlBox>
          </LeftColumn>
        )}
        <RightColumn style={{borderColor: diffColor}}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-end",
              }}
            >
              <LocaleTitle>
                {`${props.locale.name} (${props?.locale?.localeCode})`}
              </LocaleTitle>
              {defaultLocale.localeCode == props?.locale?.localeCode && (
                <DefaultTitle>{"(default locale)"}</DefaultTitle>
              )}
            </div>
            {commandMode == "edit" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: 80,
                }}
              >
                {defaultLocale.localeCode != props?.locale?.localeCode && (
                  <Icon
                    onClick={onRemove}
                    style={{ marginRight: 16 }}
                    src={trashIcon}
                  />
                )}
                <Icon onClick={onShowUpdate} src={editIcon} />
              </div>
            )}
          </div>
          {isCopyMode && (
            <div
              style={{
                height: 56,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Checkbox isChecked={isCopied} onChange={toggleCopy} />
              <span style={{ marginLeft: 12 }}>
                <PinPhrase>{"Copy Locale"}</PinPhrase>
              </span>
            </div>
          )}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <SubPropTitle>{"Fallback Locale:"}</SubPropTitle>
            <SubPropValue>{fallbackLocale}</SubPropValue>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <SubPropTitle>{"Source Locale:"}</SubPropTitle>
            <SubPropValue>{translateFromLocale}</SubPropValue>
          </div>
        </RightColumn>
      </Container>
    </>
  );

  if (!localesHasIndication && commandMode == "compare") {
    return null;
  }

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.locale}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.locale?.localeCode}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={localeRef}
      style={{ position: "relative" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      {container}
    </Reorder.Item>
  );
};

export default React.memo(LocaleBox);
