import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  PointerTypes,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useIsFloroInvalid,
  useQueryRef,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import FolderLight from "@floro/common-assets/assets/images/icons/folder.light.svg";
import FolderDark from "@floro/common-assets/assets/images/icons/folder.dark.svg";

import FolderAddedLight from "@floro/common-assets/assets/images/icons/folder.added.light.svg";
import FolderAddedDark from "@floro/common-assets/assets/images/icons/folder.added.dark.svg";

import FolderRemovedLight from "@floro/common-assets/assets/images/icons/folder.removed.light.svg";
import FolderRemovedDark from "@floro/common-assets/assets/images/icons/folder.removed.dark.svg";

import FolderConflictLight from "@floro/common-assets/assets/images/icons/folder.conflict.light.svg";
import FolderConflictDark from "@floro/common-assets/assets/images/icons/folder.conflict.dark.svg";

import ChevronLight from "@floro/common-assets/assets/images/icons/chevron.light.svg";
import ChevronDark from "@floro/common-assets/assets/images/icons/chevron.dark.svg";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/discard.light.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/discard.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import ColorPalette from "@floro/styles/ColorPalette";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import IconRow from "../icons/IconRow";
import IconPreview from "./IconPreview";

const Container = styled.div`
  margin-bottom: 24px;
`;

const FolderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const FolderIcon = styled.img`
  height: 32px;
  margin-right: 8px;
  user-select: none;
  cursor: pointer;
`;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  user-select: none;
  cursor: pointer;
`;

const ChevronWrapper = styled.div`
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4px;
  cursor: pointer;
`;

const ChevronIcon = styled.img`
  height: 16px;
  width: 16px;
  transition: transform 150ms;
  user-select: none;
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
  margin: 12px 0px 0px 40px;
`;

const IconPreviewRow = styled.div`
  margin-top: 16px;
  margin-left: 40px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const DotDotDot = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const DragShadeContainer = styled.div`
  height: 50px;
  cursor: grab;
  margin-right: 24px;
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
const DeleteShadeContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EditContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
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

const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

const RENDER_CONSTANT = 3;

interface Props {
  iconGroup: SchemaTypes["$(icons).iconGroups.id<?>"];
  iconGroupRef: PointerTypes["$(icons).iconGroups.id<?>"];
  searchText: string;
  onEdit: (
    iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"],
    icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]
  ) => void;
  onRemoveGroup: (iconGroup: SchemaTypes["$(icons).iconGroups.id<?>"]) => void;
  isEditGroups: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  index: number;
}

const Group = (props: Props) => {
  const theme = useTheme();
  const controls = useDragControls();

  const { applicationState, commandMode, compareFrom, saveState } = useFloroContext();
  const [isReOrderIconsMode, setIsReOrderIconsMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const iconGroupRef = useQueryRef(
    "$(icons).iconGroups.id<?>",
    props.iconGroup.id
  );

  const isInvalid = useIsFloroInvalid(iconGroupRef, true);
  const wasRemoved = useWasRemoved(iconGroupRef, true);
  const wasAdded = useWasAdded(iconGroupRef, true);
  const hasConflict = useHasConflict(iconGroupRef, true);

  const [iconGroup, setIconGroup] =
    useFloroState(iconGroupRef);
  const [icons, setIcons] = useState<
    SchemaTypes["$(icons).iconGroups.id<?>.icons"]
  >(iconGroup?.icons ?? []);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (wasAdded || wasRemoved || hasConflict) {
      setIsExpanded(true);
    }
  }, [wasAdded, wasRemoved, hasConflict]);

  useEffect(() => {
    if (props.iconGroup?.icons) {
      setIcons(props?.iconGroup?.icons);
    }
  }, [props.iconGroup?.icons]);

  const onRemoveIcon = useCallback(
    (icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]) => {
      if (icons && iconGroup && applicationState) {
        const filteredIcons = icons.filter((v) => v.id != icon.id);
        setIcons(filteredIcons);
        setIconGroup({ ...iconGroup, icons: filteredIcons });
      }
    },
    [iconGroup, icons, applicationState]
  );

  const onRemoveGroup = useCallback(() => {
    if (props?.iconGroup) {
      props?.onRemoveGroup?.(props?.iconGroup);
    }
  }, [props.iconGroup, props.onRemoveGroup])

  const onStartReOrderMode = useCallback(() => {
    setIsReOrderIconsMode(true);
  }, []);

  const onStopReOrderMode = useCallback(() => {
    setIsReOrderIconsMode(false);
  }, []);

  const folderIcon = useMemo(() => {
    if (wasAdded) {
      if (theme.name == "light") {
        return FolderAddedLight;
      }
      return FolderAddedDark;
    }

    if (wasRemoved) {
      if (theme.name == "light") {
        return FolderRemovedLight;
      }
      return FolderRemovedDark;
    }

    if (hasConflict) {
      if (theme.name == "light") {
        return FolderConflictLight;
      }
      return FolderConflictDark;
    }
    if (theme.name == "light") {
      return FolderLight;
    }
    return FolderDark;
  }, [theme.name, wasAdded, wasRemoved, hasConflict]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const folderText = useMemo(() => {
    if (wasAdded) {
      return theme.colors.addedText;
    }

    if (wasRemoved) {
      return theme.colors.removedText;
    }

    if (hasConflict) {
      return theme.colors.conflictText;
    }
    return theme.colors.contrastText;
  }, [theme.name, theme, wasAdded, wasRemoved, hasConflict]);

  const chevronIcon = useMemo(() => {
    if (theme.name == "light") {
      return ChevronLight;
    }
    return ChevronDark;
  }, [theme.name]);

  const isSearching = useMemo(
    () => props.searchText.trim() != "",
    [props.searchText]
  );
  const hasSearchMatches = useMemo(() => {
    if (!isSearching) {
      return false;
    }

    for (const icon of props?.iconGroup?.icons) {
      if (
        icon?.name?.toLowerCase().indexOf(icon.name.toLowerCase().trim()) != -1
      ) {
        return true;
      }
    }
    return false;
  }, [props.searchText, props?.iconGroup?.icons, isSearching]);

  const onToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const onReOrderIcons = useCallback(
    (values: SchemaTypes["$(icons).iconGroups.id<?>.icons"]) => {
      if (applicationState && iconGroup?.icons) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef(
              "$(icons).iconGroups.id<?>.icons.id<?>",
              iconGroup.id,
              v.id
            )
          );
        });
        setIcons(remap);
      }
    },
    [applicationState, icons]
  );

  const previewIcons = useMemo(() => {
    return iconGroup?.icons?.slice(0, 12) ?? [];
  }, [iconGroup?.icons]);
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  //useEffect(() => {
  //  if (
  //    !isDragging &&
  //    iconGroup &&
  //    commandMode == "edit" &&
  //    icons != props.iconGroup.icons &&
  //    icons
  //  ) {
  //    iconGroup.icons = icons;
  //    save();
  //  }
  //}, [isDragging]);

  const isDisplayingIcons = useMemo(() => {
    if (
      (isExpanded && !isSearching && !props.isEditGroups) ||
      (hasSearchMatches && hasSearchMatches)
    ) {
      return true;
    }
    return false;
  }, [
    isExpanded,
    isSearching,
    props.isEditGroups,
    hasSearchMatches,
    hasSearchMatches,
  ]);

  const iconsToRender = useMemo(() => {
    if (isDisplayingIcons) {
      return icons?.filter?.((icon) => {
        if (!icon?.id) {
          return false;
        }
        if (
          icon?.name
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
        return false;
      });
    }
    return [];
  }, [isDisplayingIcons, icons, props.searchText]);

  const [renderLimit, setRenderLimit] = useState(RENDER_CONSTANT);

  useEffect(() => {
    setRenderLimit(RENDER_CONSTANT);
  }, [props.searchText]);

  useEffect(() => {
    if (isDisplayingIcons) {
      if (isReOrderIconsMode) {
        setRenderLimit(RENDER_CONSTANT);
        return;
      }
      if (renderLimit < iconsToRender.length) {
        const timeout = setTimeout(() => {
          setRenderLimit(renderLimit + RENDER_CONSTANT);
        }, 20);
        return () => {
          clearTimeout(timeout);
        };
      }
    } else {
      if (renderLimit != RENDER_CONSTANT) {
        setRenderLimit(RENDER_CONSTANT);
      }
    }
  }, [isDisplayingIcons, iconsToRender, renderLimit, isReOrderIconsMode]);

  const renderLimitedIcons = useMemo(() => {
    if (isReOrderIconsMode) {
      return iconsToRender;
    }
    return iconsToRender.slice(0, renderLimit);
  }, [iconsToRender, renderLimit, isReOrderIconsMode]);

  useEffect(() => {
    if (isSearching && isReOrderIconsMode) {
      setIsReOrderIconsMode(false);
    }
  }, [isSearching, isReOrderIconsMode]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event, {
        snapToCursor: false,
      });
    },
    [controls]
  );
  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

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
  if (isSearching && iconsToRender.length == 0) {
    return null;
  }

  const container = (
    <Container>
      <FolderRow>
        {props.isEditGroups && commandMode == "edit" && (
          <DragShadeContainer onPointerDown={onPointerDown}>
            <DragIcon src={draggerIcon} />
          </DragShadeContainer>
        )}
        <FolderIcon onClick={onToggle} src={folderIcon} />
        <Title style={{ color: folderText }} onClick={onToggle}>
          {props.iconGroup.name}
        </Title>
        {props.isEditGroups && commandMode == "edit" && (
          <>
            <DeleteShadeContainer onClick={onRemoveGroup}>
              <DeleteShade src={trashIcon} />
            </DeleteShadeContainer>
          </>
        )}
        {!isSearching && !props.isEditGroups && (icons?.length ?? 0) > 0 && (
          <ChevronWrapper onClick={onToggle}>
            <ChevronIcon
              src={chevronIcon}
              style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
          </ChevronWrapper>
        )}
      </FolderRow>
      {commandMode == "edit" &&
        isExpanded &&
        !isSearching &&
        (props?.iconGroup?.icons?.length ?? 0) > 0 &&
        !props.isEditGroups && (
          <SubTitleRow>
            {!isReOrderIconsMode && (
              <SubTitle
                onClick={onStartReOrderMode}
              >{`organize ${props.iconGroup.name} icons`}</SubTitle>
            )}
            {isReOrderIconsMode && (
              <SubTitle
                onClick={onStopReOrderMode}
              >{`done organizing ${props.iconGroup.name} icons`}</SubTitle>
            )}
          </SubTitleRow>
        )}
      {!isExpanded &&
        !isSearching &&
        previewIcons.length > 0 &&
        !props.isEditGroups && (
          <IconPreviewRow>
            {previewIcons?.map?.((icon, index) => {
              const iconRef = makeQueryRef(
                "$(icons).iconGroups.id<?>.icons.id<?>",
                props.iconGroup.id,
                icon.id
              );
              return (
                <IconPreview
                  key={iconRef}
                  icon={icon}
                  index={index}
                  iconRef={iconRef}
                />
              );
            })}
            <DotDotDot>{"..."}</DotDotDot>
          </IconPreviewRow>
        )}
      {((isExpanded && !isSearching && !props.isEditGroups) ||
        (hasSearchMatches && hasSearchMatches)) && (
        <>
          {!isReOrderIconsMode &&
            renderLimitedIcons?.map?.((icon, index) => {
              const iconRef = makeQueryRef(
                "$(icons).iconGroups.id<?>.icons.id<?>",
                props.iconGroup.id,
                icon.id
              );
              return (
                <IconRow
                  onEdit={props.onEdit}
                  searchText={props.searchText}
                  key={icon.id}
                  iconRef={iconRef}
                  icon={icon}
                  index={index}
                  onRemove={onRemoveIcon}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDragging={isDragging}
                  isReOrderMode={isReOrderIconsMode}
                />
              );
            })}
          {isReOrderIconsMode && (
            <AnimatePresence>
              <Reorder.Group
                axis="y"
                values={renderLimitedIcons ?? []}
                onReorder={onReOrderIcons}
              >
                {renderLimitedIcons?.map?.((icon, index) => {
                  const iconRef = makeQueryRef(
                    "$(icons).iconGroups.id<?>.icons.id<?>",
                    props.iconGroup.id,
                    icon.id
                  );
                  return (
                    <IconRow
                      onEdit={props.onEdit}
                      searchText={props.searchText}
                      key={icon.id}
                      iconRef={iconRef}
                      icon={icon}
                      index={index}
                      onRemove={onRemoveIcon}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      isDragging={isDragging}
                      isReOrderMode={isReOrderIconsMode}
                    />
                  );
                })}
              </Reorder.Group>
            </AnimatePresence>
          )}
        </>
      )}
    </Container>
  );
  if (!props.isEditGroups) {
    return (<>{container}</>)
  }
  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.iconGroup}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.iconGroup.id}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.iconGroupRef}
      style={{ position: "relative" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      {container}
    </Reorder.Item>
  );
};

export default React.memo(Group);
