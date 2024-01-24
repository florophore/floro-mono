
import React, { useCallback, useMemo, useState } from "react";
import {
  SchemaTypes,
  containsDiffable,
  makeQueryRef,
  useFloroContext,
} from "../floro-schema-api";
import PhraseGroup from "./PhraseGroup";
import styled from "@emotion/styled";
import { AnimatePresence, Reorder } from "framer-motion";

const Container = styled.div`
  padding-bottom: 40px;
  width: 100%;
  min-height: 100vh;
  margin-bottom: 700px;
`;

const NothingChangedText = styled.h3`
  margin-top: 24px;
  font-family: "MavenPro";
  font-size: 48px;
  font-weight: 500;
  color: ${props => props.theme.colors.contrastTextLight};
`;

interface Props {
  searchText: string;
  isEditingGroups: boolean;
  selectedTopLevelLocale: string;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  filterTag: string|null;
  showOnlyPinnedPhrases: boolean;
  showOnlyPinnedGroups: boolean;
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
  scrollContainer: HTMLDivElement;
  phraseGroups: SchemaTypes['$(text).phraseGroups'];
  setPhraseGroups: (pgs: SchemaTypes['$(text).phraseGroups'], doSave?: boolean) => void;
  savePhraseGroups: () => void;
  showFilters?: boolean;
  pinnedPhrasesWithGroups: {
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
    phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  }[];
  selectedGroup: string | null;
  pinnedGroups: Array<string>|null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
  messagePhrase: {groupName: string, phraseKey: string}|null;
  onClearMessage: () => void;
}

const PhraseGroups = (props: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode, changeset, conflictSet, compareFrom } = useFloroContext();

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    props.savePhraseGroups();
  }, [props.savePhraseGroups]);

  const onReOrderPhraseGroups = useCallback(
    (values: SchemaTypes["$(text).phraseGroups"]) => {
      if (values) {
        props.setPhraseGroups(values, false);
      }
    },
    [applicationState, props.setPhraseGroups]
  );

  const onRemoveGroup = useCallback(
    (value: SchemaTypes["$(text).phraseGroups.id<?>"]) => {
      if (props.phraseGroups) {
        const remap = props.phraseGroups.filter(v => v.id != value.id);
        props.setPhraseGroups(remap);
      }
    },
    [props.phraseGroups, props.setPhraseGroups]
  );

  //const diffedPhrases = useMemo(() => {
  //  if (commandMode != "compare") {
  //    return 0;
  //  }
  //  let count = 0;
  //  for (const phraseGroup of applicationState?.text?.phraseGroups ?? []) {
  //    const phraseGroupRef = makeQueryRef(`$(text).phraseGroups.id<?>`, phraseGroup.id);
  //    const hasDiff = containsDiffable(changeset, `${phraseGroupRef}.phrases`, true)
  //    const containConflict = containsDiffable(conflictSet, `${phraseGroupRef}.phrases`, true)
  //    if (hasDiff || containConflict) {
  //      count++;
  //    }
  //  }
  //  return count;
  //}, [commandMode, applicationState, changeset, conflictSet])

  if (props.isEditingGroups && commandMode == "edit") {
    return (
      <Container>
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={props.phraseGroups ?? []}
            onReorder={onReOrderPhraseGroups}
            style={{listStyle: "none"}}
          >
            {props.phraseGroups?.map((phraseGroup, index: number) => {
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
                  scrollContainer={props.scrollContainer}
                  showFilters={props.showFilters}
                  pinnedPhrasesWithGroups={props.pinnedPhrasesWithGroups}
                  selectedGroup={props.selectedGroup}
                  pinnedGroups={props.pinnedGroups}
                  setPinnedGroups={props.setPinnedGroups}
                  showOnlyPinnedGroups={props.showOnlyPinnedGroups}
                  messagePhrase={props.messagePhrase}
                  onClearMessage={props.onClearMessage}
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
            values={props.phraseGroups ?? []}
            onReorder={onReOrderPhraseGroups}
            style={{listStyle: "none"}}
          >
            {props.phraseGroups?.map((phraseGroup, index: number) => {
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
                  scrollContainer={props.scrollContainer}
                  showFilters={props.showFilters}
                  pinnedPhrasesWithGroups={props.pinnedPhrasesWithGroups}
                  selectedGroup={props.selectedGroup}
                  pinnedGroups={props.pinnedGroups}
                  setPinnedGroups={props.setPinnedGroups}
                  showOnlyPinnedGroups={props.showOnlyPinnedGroups}
                  messagePhrase={props.messagePhrase}
                  onClearMessage={props.onClearMessage}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
      {(!props.isEditingGroups || commandMode != "edit") &&
        props.phraseGroups?.map((phraseGroup, index: number) => {
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
              scrollContainer={props.scrollContainer}
              showFilters={props.showFilters}
              pinnedPhrasesWithGroups={props.pinnedPhrasesWithGroups}
              selectedGroup={props.selectedGroup}
              pinnedGroups={props.pinnedGroups}
              setPinnedGroups={props.setPinnedGroups}
              showOnlyPinnedGroups={props.showOnlyPinnedGroups}
              messagePhrase={props.messagePhrase}
              onClearMessage={props.onClearMessage}
            />
          );
        })}
    </Container>
  );
};

export default React.memo(PhraseGroups);
