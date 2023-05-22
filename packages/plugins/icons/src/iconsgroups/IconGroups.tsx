import React, { useCallback, useEffect, useState } from "react";
import {
  PointerTypes,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
} from "../floro-schema-api";
import Group from "./Group";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, Reorder } from "framer-motion";

const Container = styled.div`
  margin-top: 24px;
  padding-bottom: 120px;
`;

interface Props {
  searchText: string;
  onEdit: (
    iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"],
    icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]
  ) => void;
  isEditGroups: boolean;
}

const IconGroups = (props: Props) => {
  const [iconGroups, setIconGroups, isLoading, save] =
    useFloroState("$(icons).iconGroups") ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode } = useFloroContext();

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onReOrderIcons = useCallback(
    (values: SchemaTypes["$(icons).iconGroups"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef("$(icons).iconGroups.id<?>", v.id)
          );
        });
        setIconGroups(remap, false);
      }
    },
    [applicationState]
  );

  const onRemoveGroup = useCallback(
    (value: SchemaTypes["$(icons).iconGroups.id<?>"]) => {
      if (iconGroups) {
        const remap = iconGroups.filter(v => v.id != value.id);
        setIconGroups(remap, true);
      }
    },
    [iconGroups]
  );

  useEffect(() => {
    if (
      props.isEditGroups &&
      !isDragging &&
      iconGroups &&
      commandMode == "edit"
    ) {
      save();
    }
  }, [isDragging, iconGroups, props.isEditGroups]);

  return (
    <Container>
      {props.isEditGroups && (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={iconGroups ?? []}
            onReorder={onReOrderIcons}
          >
            {iconGroups?.map((iconGroup, index: number) => {
              const iconGroupRef = makeQueryRef(
                "$(icons).iconGroups.id<?>",
                iconGroup.id
              );
              return (
                <Group
                  key={iconGroup.id}
                  iconGroup={iconGroup}
                  iconGroupRef={iconGroupRef}
                  searchText={props.searchText}
                  onEdit={props.onEdit}
                  isEditGroups={props.isEditGroups}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  index={index}
                  onRemoveGroup={onRemoveGroup}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
      {!props.isEditGroups &&
        iconGroups?.map((iconGroup, index: number) => {
          const iconGroupRef = makeQueryRef(
            "$(icons).iconGroups.id<?>",
            iconGroup.id
          );
          return (
            <Group
              key={iconGroup.id}
              iconGroup={iconGroup}
              iconGroupRef={iconGroupRef}
              searchText={props.searchText}
              onEdit={props.onEdit}
              isEditGroups={props.isEditGroups}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              index={index}
              onRemoveGroup={onRemoveGroup}
            />
          );
        })}
    </Container>
  );
};

export default React.memo(IconGroups);
