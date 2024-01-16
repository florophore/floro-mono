import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  PointerTypes,
  SchemaTypes,
  containsDiffable,
  getReferencedObject,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useHasIndication,
  useQueryRef,
  useReferencedObject,
} from "../floro-schema-api";
import TermReOrderRow from "./TermReOrderRow";
import TermRow from "./TermRow";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, Reorder } from "framer-motion";

const NothingChangedText = styled.h3`
  margin-top: 24px;
  font-family: "MavenPro";
  font-size: 48px;
  font-weight: 500;
  color: ${props => props.theme.colors.contrastTextLight};
`;

const Container = styled.div`
  margin-top: 24px;
  padding-bottom: 120px;
  width: 100%;
  padding-left: 24px;
  padding-right: 48px;
`;

interface Props {
  searchTermText: string;
  isEditTerms: boolean;
  selectedTopLevelLocale: string;
  globalFilterUntranslatedTerms: boolean;
  showOnlyPinnedTerms: boolean;
  pinnedTerms: Array<string>|null;
  setPinnedTerms: (phraseRegs: Array<string>) => void;
  removePinnedTerms: () => void;
  terms: SchemaTypes['$(text).terms']
  setTerms: (terms: SchemaTypes['$(text).terms'], doSave?: boolean) => void;
  saveTerms: () => void;
  scrollContainer: HTMLDivElement;
  selectedTerm: string|null;
  showFilters: boolean;
}

const TermList = (props: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode, compareFrom, changeset } =
    useFloroContext();
  const [dimissedUntraslated, setDismissedUntranslated] = useState<
    Array<string>
  >([]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    props.saveTerms();
  }, [props.saveTerms]);

  const onReOrderTerms = useCallback(
    (values: SchemaTypes["$(text).terms"]) => {
      props.setTerms(values, false);
    },
    [props.setTerms, applicationState]
  );

  const onRemoveTerm = useCallback(
    (value: SchemaTypes["$(text).terms.id<?>"]) => {
      if (props.terms) {
        const remap = props.terms.filter((v) => v.id != value.id);
        props.setTerms(remap, true);
      }
    },
    [props.setTerms, props.terms]
  );

  const diffedTerms = useMemo(() => {
    if (commandMode != "compare") {
      return 0;
    }
    let count = 0;
    for (const term of applicationState?.text?.terms ?? []) {
      const termRef = makeQueryRef(`$(text).terms.id<?>`, term.id);
      const hasDiff = containsDiffable(changeset, termRef, true);
      if (hasDiff) {
        count++;
      }
    }
    return count;
  }, [commandMode, applicationState, changeset]);

  const memoryLeakedTerms = useMemo(() => {
    return props.terms.filter((term) => {
      if (!term?.id) {
        return false;
      }
      if (dimissedUntraslated.includes(term.id)) {
        return false;
      }
      return true;
    });
  }, [
    dimissedUntraslated,
    props.searchTermText,
    props.showOnlyPinnedTerms,
    props.pinnedTerms,
    props.globalFilterUntranslatedTerms,
    props.terms.length,
    props.selectedTopLevelLocale,
  ]);

  useEffect(() => {
    if (props.globalFilterUntranslatedTerms) {
      setDismissedUntranslated([]);
    }
  }, [props.globalFilterUntranslatedTerms, props.terms]);

  if (commandMode == "compare" && compareFrom == "before" && diffedTerms == 0) {
    return (
      <Container
        style={{
          height: "calc(100vh - 144px)",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NothingChangedText>{"No terms removed"}</NothingChangedText>
      </Container>
    );
  }
  if (commandMode == "compare" && compareFrom == "after" && diffedTerms == 0) {
    return (
      <Container
        style={{
          height: "calc(100vh - 144px)",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NothingChangedText>{"No terms added"}</NothingChangedText>
      </Container>
    );
  }

  return (
    <Container>
      {props.isEditTerms && (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={props.terms ?? []}
            onReorder={onReOrderTerms}
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {props.terms?.map((term, index: number) => {
              return (
                <TermReOrderRow
                  key={term.id}
                  term={term}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  index={index}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
      {!props.isEditTerms &&
        memoryLeakedTerms?.map((term, index: number) => {
          const termRef = makeQueryRef("$(text).terms.id<?>", term.id);
          return (
            <TermRow
              key={term.id}
              term={term}
              termRef={termRef}
              index={index}
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              globalFilterUntranslatedTerms={
                props.globalFilterUntranslatedTerms
              }
              pinnedTerms={props.pinnedTerms}
              setPinnedTerms={props.setPinnedTerms}
              onRemove={onRemoveTerm}
              selectedTerm={props.selectedTerm}
              scrollContainer={props.scrollContainer}
              showFilters={props.showFilters}
              onSetDismissedUnTranslated={(termId) => {
                setDismissedUntranslated([...dimissedUntraslated, termId]);
              }}
            />
          );
        })}
    </Container>
  );
};

export default React.memo(TermList);
