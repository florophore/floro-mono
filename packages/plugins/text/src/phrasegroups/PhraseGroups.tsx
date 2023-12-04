
import React, { useCallback, useMemo, useState } from "react";
import {
  SchemaTypes,
  containsDiffable,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useWasRemoved,
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
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
}

const PhraseGroups = (props: Props) => {
  const [phraseGroups, setPhraseGroups, savePhraseGroups] =
    useFloroState("$(text).phraseGroups") ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode, changeset, compareFrom } = useFloroContext();

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

  const diffedPhrases = useMemo(() => {
    if (commandMode != "compare") {
      return 0;
    }
    let count = 0;
    for (const phraseGroup of applicationState?.text?.phraseGroups ?? []) {
      const phraseGroupRef = makeQueryRef(`$(text).phraseGroups.id<?>`, phraseGroup.id);
      const hasDiff = containsDiffable(changeset, `${phraseGroupRef}.phrases`, true)
      if (hasDiff) {
        count++;
      }
    }
    return count;
  }, [commandMode, applicationState, changeset])

  if (commandMode == "compare" && compareFrom == "before" && diffedPhrases == 0) {
    return (
      <Container>
        <NothingChangedText>
          {'No phrases were removed'}
        </NothingChangedText>
      </Container>
    );

  }
  if (commandMode == "compare" && compareFrom == "after" && diffedPhrases == 0) {
    return (
      <Container>
        <NothingChangedText>
          {'No phrases were added'}
        </NothingChangedText>
      </Container>
    );
  }

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
