import React, { useMemo, useCallback } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useBinaryData,
  useExtractQueryArgs,
  useFloroContext,
  useHasConflict,
  useIsFloroInvalid,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import TrashLight from "@floro/common-assets/assets/images/icons/discard.light.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/discard.dark.svg";

import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import IconThemeDefCell from "./IconThemeDefCell";
import IconThemeDefVariantCell from "./IconThemeDefVariantCell";
import IconPreview from "../iconsgroups/IconPreview";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  margin-left: 8px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const IncludeVariantsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
  margin-left: 40px;
`;

const IncludeVariantsText = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  padding: 0;
  margin: 0;
  margin-right: 8px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 16px;
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
`;

const ColorControlsContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72px;
`;

const DeleteShadeContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EditContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteShade = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const EditIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const DragShadeContainer = styled.div`
  height: 50px;
  cursor: grab;
  margin-right: 24px;
  margin-top: 14px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const IndicatorCircle = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
  background: ${(props) => props.theme.colors.contrastText};
`;

const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

const paletteCellVariants = {
  active: {
    height: 20,
    width: 104,
    y: -30,
    scale: 0.35,
    marginTop: 12,
  },
  inactive: {
    scale: 1,
    marginTop: 0,
    height: "auto",
    transition: { duration: 0.3 },
  },
};

interface Props {
  iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"];
  icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"];
  index: number;
  onRemove: (
    icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]
  ) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isReOrderMode: boolean;
  searchText: string;
  onEdit: (
    iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"],
    icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]
  ) => void;
}

const IconRow = (props: Props) => {
  const theme = useTheme();
  const isInvalid = useIsFloroInvalid(props.iconRef, true);
  const wasRemoved = useWasRemoved(props.iconRef, true);
  const wasAdded = useWasAdded(props.iconRef, true);
  const hasConflict = useHasConflict(props.iconRef, false);
  const { commandMode, compareFrom } = useFloroContext();
  const controls = useDragControls();

  const motionState = useMemo(() => {
    if (props.isReOrderMode && commandMode == "edit") {
      return "active";
    }
    return "inactive";
  }, [props.isReOrderMode, commandMode]);

  const color = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictText;
    }
    if (wasRemoved) {
      return theme.colors.removedText;
    }
    if (wasAdded) {
      return theme.colors.addedText;
    }
    return theme.colors.contrastText;
  }, [theme, wasRemoved, wasAdded, hasConflict]);

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const title = useMemo(
    () => (isInvalid ? props.icon.id : props.icon.name),
    [isInvalid, props.icon]
  );

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

  const onRemove = useCallback(() => {
    if (props.icon) {
      props.onRemove(props.icon);
    }
  }, [props.icon, props.onRemove]);

  const onEdit = useCallback(() => {
    if (props.icon) {
      props.onEdit(props.iconRef, props.icon);
    }
  }, [props.icon, props.iconRef, props.onEdit]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event, {
        snapToCursor: false,
      });
    },
    [controls]
  );


  const selectedVariantsMap = useMemo(() => {
    return props.icon.enabledVariants?.reduce((acc, enabledVariant) => {
      return {
        ...acc,
        [enabledVariant.id]: enabledVariant.enabled,
      };
    }, {});
  }, [props.icon]);

  const appliedThemesMap = useMemo(() => {
    return props.icon.appliedThemes?.reduce((acc, appliedTheme) => {
      return {
        ...acc,
        [appliedTheme.hexcode]: appliedTheme.themeDefinition,
      };
    }, {});
  }, [props.icon]);

  const includeVariants = useMemo(
    () =>
      Object.keys(selectedVariantsMap ?? {}).reduce((hasVariant, k) => {
        if (hasVariant || selectedVariantsMap?.[k]) {
          return true;
        }
        return false;
      }, false),
    [selectedVariantsMap]
  );

  const themes = useReferencedObject("$(theme).themes");
  const stateVariants = useReferencedObject("$(theme).stateVariants");
  const { data: svgData } = useBinaryData(props.icon.svg, "text");

  const isSearching = useMemo(
    () => props.searchText.trim() != "",
    [props.searchText]
  );
  const hasSearchMatches = useMemo(() => {
    if (!isSearching) {
      return false;
    }
    if (
      props.icon?.name
        ?.toLowerCase()
        .indexOf(props.searchText.toLowerCase().trim()) != -1
    ) {
      return true;
    }
    return false;
  }, [props.searchText, props.icon, isSearching]);


  const hasAnyRemovals = useWasRemoved("$(icons).iconGroups", true);
  const hasAnyAdditions = useWasAdded("$(icons).iconGroups", true);

  if (isSearching && !hasSearchMatches) {
    return null;
  }

  if (!isSearching && commandMode == "compare" && (hasAnyRemovals || hasAnyAdditions)) {
    if (!wasRemoved && compareFrom == "before") {
      return null;
    }
    if (!wasAdded && compareFrom == "after") {
      return null;
    }
  }

  const container = (
      <Container>
        <TitleRow>
          {commandMode != "edit" && (
            <>
              <DragShadeContainer style={{ cursor: "default" }}>
                <IndicatorCircle style={{ backgroundColor: color }} />
              </DragShadeContainer>
              <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>
              {isInvalid && <WarningIconImg src={warningIcon} />}
            </>
          )}
          {commandMode == "edit" && (
            <>
              {props.isReOrderMode && (
                <ColorControlsContainer>
                  <DragShadeContainer onPointerDown={onPointerDown}>
                    <DragIcon src={draggerIcon} />
                  </DragShadeContainer>
                  <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>

                  {props.isReOrderMode && (
                    <div style={{
                      height: 72,
                      width: 72,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 16

                    }}>
                      <IconPreview
                        icon={props.icon}
                        index={props.index}
                        iconRef={props.iconRef}
                      />
                    </div>
                  )}
                  {isInvalid && (
                    <WarningIconImg
                      style={{ marginTop: 14 }}
                      src={warningIcon}
                    />
                  )}
                </ColorControlsContainer>
              )}
              {!props.isReOrderMode && (
                <ColorControlsContainer>
                  <DragShadeContainer style={{ cursor: "default" }}>
                    <IndicatorCircle style={{ backgroundColor: color }} />
                  </DragShadeContainer>
                  <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>
                  <EditContainer onClick={onEdit}>
                    <EditIcon src={editIcon} />
                  </EditContainer>
                  {(
                    <DeleteShadeContainer onClick={onRemove}>
                      <DeleteShade src={trashIcon} />
                    </DeleteShadeContainer>
                  )}
                  {isInvalid && (
                    <WarningIconImg
                      style={{ marginTop: 14 }}
                      src={warningIcon}
                    />
                  )}

                </ColorControlsContainer>
              )}
            </>
          )}
        </TitleRow>
        {commandMode == "edit" && false && (
          <IncludeVariantsWrapper>
            <IncludeVariantsText>{"Copy Icon"}</IncludeVariantsText>
            <Checkbox
              disabled={commandMode != "edit"}
              isChecked={false}
              onChange={function (isChecked: boolean): void {
                throw new Error("Function not implemented.");
              }}
            />
          </IncludeVariantsWrapper>
        )}
        {(!props.isReOrderMode || commandMode != "edit") && (
          <div>
            <RowWrapper>
              <Row>
                {!includeVariants && (
                  <>
                    {themes?.map((themeObject) => {
                      return (
                        <IconThemeDefCell
                          key={`${themeObject.id}`}
                          themeObject={themeObject}
                          defaultIconTheme={props.icon.defaultIconTheme}
                          remappedSVG={svgData ?? ""}
                          appliedThemes={appliedThemesMap}
                        />
                      );
                    })}
                  </>
                )}
                {includeVariants && (
                  <>
                    <Col>
                      {themes?.map((themeObject) => {
                        return (
                          <IconThemeDefCell
                            key={`${themeObject.id}`}
                            themeObject={themeObject}
                            defaultIconTheme={props.icon.defaultIconTheme}
                            remappedSVG={svgData ?? ""}
                            appliedThemes={appliedThemesMap}
                          />
                        );
                      })}
                    </Col>
                    {stateVariants
                      ?.filter((s) => {
                        const stateVariantRef = makeQueryRef(
                          "$(theme).stateVariants.id<?>",
                          s.id
                        );
                        return !!selectedVariantsMap?.[stateVariantRef];
                      })
                      ?.map((variant) => {
                        return (
                          <Col key={variant.id}>
                            {themes?.map((themeObject) => {
                              const stateVariantRef = makeQueryRef(
                                "$(theme).stateVariants.id<?>",
                                variant.id
                              );
                              const themeRef = makeQueryRef(
                                "$(theme).themes.id<?>",
                                themeObject.id
                              );
                              return (
                                <IconThemeDefVariantCell
                                  key={`${variant.id}-${themeObject.id}`}
                                  selectedVariants={selectedVariantsMap}
                                  defaultIconTheme={props.icon.defaultIconTheme}
                                  remappedSVG={svgData ?? ""}
                                  appliedThemes={appliedThemesMap}
                                  stateVariantRef={stateVariantRef}
                                  themeRef={themeRef}
                                />
                              );
                            })}
                          </Col>
                        );
                      })}
                  </>
                )}
              </Row>
            </RowWrapper>
          </div>
        )}
      </Container>
  )

  if (!props.isReOrderMode) {
    return <>{container}</>;
  }

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.icon}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.icon.id}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.iconRef}
      style={{ position: "relative" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      {container}
    </Reorder.Item>
  );
};

export default React.memo(IconRow);
