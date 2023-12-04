
import React, { useCallback, useState } from "react";
import {
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
} from "../floro-schema-api";
import PhraseGroup from "./PhraseGroup";
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
  const [phraseGroups, setPhraseGroups, savePhraseGroups] =
    useFloroState("$(text).phraseGroups") ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode } = useFloroContext();

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    savePhraseGroups();
  }, [savePhraseGroups]);

  const onReOrderPhraseGroups = useCallback(
    (values: SchemaTypes["$(text).phraseGroups"]) => {
      if (values) {
        setPhraseGroups(values, false);
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

  if (props.isEditingGroups && commandMode == "edit") {
    return (
      <Container>
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={phraseGroups ?? []}
            onReorder={onReOrderPhraseGroups}
            style={{listStyle: "none"}}
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

      </Container>
    )
  }

  return (
    <Container>
      {props.isEditingGroups && commandMode == "edit" && (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={phraseGroups ?? []}
            onReorder={onReOrderPhraseGroups}
            style={{listStyle: "none"}}
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
              isEditingGroups={false}
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
