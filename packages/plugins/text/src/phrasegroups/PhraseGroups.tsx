
import React, { useCallback, useEffect, useState } from "react";
import {
  PointerTypes,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
} from "../floro-schema-api";
import PhraseGroup from "./PhraseGroup";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, Reorder } from "framer-motion";

const Container = styled.div`
  margin-top: 24px;
  padding-bottom: 40px;
  max-width: 1020px;
  width: 100%;
`;

interface Props {
  searchText: string;
  isEditingGroups: boolean;
  selectedTopLevelLocale: string;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  filterTag: string|null;
  showOnlyPinnedPhrases: boolean;
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
}

const PhraseGroups = (props: Props) => {
  const [phraseGroups, setPhraseGroups] =
    useFloroState("$(text).phraseGroups") ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode } = useFloroContext();

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onReOrderPhraseGroups = useCallback(
    (values: SchemaTypes["$(text).phraseGroups"]) => {
      if (applicationState) {
        const remap = values.map((v) => {
          return getReferencedObject(
            applicationState,
            makeQueryRef("$(text).phraseGroups.id<?>", v.id)
          );
        });
        setPhraseGroups(remap);
      }
    },
    [applicationState]
  );

  const onRemoveGroup = useCallback(
    (value: SchemaTypes["$(text).phraseGroups.id<?>"]) => {
      if (phraseGroups) {
        const remap = phraseGroups.filter(v => v.id != value.id);
        setPhraseGroups(remap);
      }
    },
    [phraseGroups]
  );

  return (
    <Container>
      {props.isEditingGroups && commandMode == "edit" && (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={phraseGroups ?? []}
            onReorder={onReOrderPhraseGroups}
          >
            {phraseGroups?.map((phraseGroup, index: number) => {
              return (
                <PhraseGroup
                  key={phraseGroup.id}
                  phraseGroup={phraseGroup}
                  searchText={props.searchText}
                  isEditingGroups={props.isEditingGroups}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  index={index}
                  onRemoveGroup={onRemoveGroup}
                  selectedTopLevelLocale={props.selectedTopLevelLocale}
                  globalFilterUntranslated={props.globalFilterUntranslated}
                  globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
                  filterTag={props.filterTag}
                  showOnlyPinnedPhrases={props.showOnlyPinnedPhrases}
                  pinnedPhrases={props.pinnedPhrases}
                  setPinnedPhrases={props.setPinnedPhrases}
                  removePinnedPhrases={props.removePinnedPhrases}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
      {(!props.isEditingGroups || commandMode != "edit") &&
        phraseGroups?.map((phraseGroup, index: number) => {
          return (
            <PhraseGroup
              key={phraseGroup.id}
              phraseGroup={phraseGroup}
              searchText={props.searchText}
              isEditingGroups={props.isEditingGroups}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              index={index}
              onRemoveGroup={onRemoveGroup}
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              globalFilterUntranslated={props.globalFilterUntranslated}
              globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
              filterTag={props.filterTag}
              showOnlyPinnedPhrases={props.showOnlyPinnedPhrases}
              pinnedPhrases={props.pinnedPhrases}
              setPinnedPhrases={props.setPinnedPhrases}
              removePinnedPhrases={props.removePinnedPhrases}
            />
          );
        })}
    </Container>
  );
};

export default React.memo(PhraseGroups);
