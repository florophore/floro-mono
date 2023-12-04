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
  max-width: 1020px;
  width: 100%;
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
}

const TermList = (props: Props) => {
  const [terms, setTerms, saveTerms] =
    useFloroState("$(text).terms") ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const { applicationState, commandMode, compareFrom, changeset } = useFloroContext();

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    saveTerms();
  }, [saveTerms]);

  const onReOrderTerms = useCallback(
    (values: SchemaTypes["$(text).terms"]) => {
      if (applicationState) {
        setTerms(values, false);
      }
    },
    [applicationState]
  );

  const onRemoveTerm = useCallback(
    (value: SchemaTypes["$(text).terms.id<?>"]) => {
      if (terms) {
        const remap = terms.filter(v => v.id != value.id);
        setTerms(remap);
      }
    },
    [terms]
  );

  const topLevelLocaleRef = useQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedTopLevelLocale
  );

  const termsToRender = useMemo(() => {
    if (!applicationState) {
    return terms;
    }
    if (props.showOnlyPinnedTerms && props.pinnedTerms) {
    return terms?.filter((term) => {
        const termRef = `$(text).terms.id<${term.id}>`;
        return props.pinnedTerms?.includes(termRef);
    });
    }
    return terms
    ?.filter((term) => {
        if (!props.globalFilterUntranslatedTerms) {
            return true;
        }
        const termRef = `$(text).terms.id<${term.id}>`;
        if (props.pinnedTerms?.includes(termRef)) {
            return true;
        }
        for (let localeTerm of term.localizedTerms ?? []) {
            if (localeTerm.id != topLevelLocaleRef) {
                continue;
            }
            if ((localeTerm.termValue ?? "").trim() == "") {
                return true;
            }
        }

    })
    .filter?.((term) => {
        if (!term?.name) {
            return false;
        }
        const termRef = `$(text).terms.id<${term.id}>`;
        if (props.pinnedTerms?.includes(termRef)) {
            return true;
        }
        if (
        (term?.name ?? "")
            ?.toLowerCase()
            .indexOf(props.searchTermText.toLowerCase().trim()) != -1
            ) {
        return true;
        }
        for (let localizedTerm of term?.localizedTerms ?? []) {
          if (localizedTerm.id != topLevelLocaleRef) {
            continue;
          }
          if (
            (localizedTerm.termValue ?? "")
              ?.toLowerCase()
              .indexOf(props.searchTermText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
          if (
            (localizedTerm.localNotes ?? "")
              ?.toLowerCase()
              .indexOf(props.searchTermText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
        }
        return false;
    });
  }, [
    applicationState,
    topLevelLocaleRef,
    terms,
    props.searchTermText,
    props.globalFilterUntranslatedTerms,
    props.showOnlyPinnedTerms,
    props.pinnedTerms,
  ]);

  const diffedTerms = useMemo(() => {
    if (commandMode != "compare") {
      return 0;
    }
    let count = 0;
    for (const term of applicationState?.text?.terms ?? []) {
      const termRef = makeQueryRef(`$(text).terms.id<?>`, term.id);
      const hasDiff = containsDiffable(changeset, termRef, true)
      if (hasDiff) {
        count++;
      }
    }
    return count;
  }, [commandMode, applicationState, changeset])

  if (commandMode == "compare" && compareFrom == "before" && diffedTerms == 0) {
    return (
      <Container>
        <NothingChangedText>
          {'No terms were removed'}
        </NothingChangedText>
      </Container>
    );

  }
  if (commandMode == "compare" && compareFrom == "after" && diffedTerms == 0) {
    return (
      <Container>
        <NothingChangedText>
          {'No terms were added'}
        </NothingChangedText>
      </Container>
    );
  }

  return (
    <Container>
      {props.isEditTerms && (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={terms ?? []}
            onReorder={onReOrderTerms}
            style={{listStyle: "none", margin: 0, padding: 0 }}
          >
            {terms?.map((term, index: number) => {
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
        termsToRender?.map((term, index: number) => {
          const termRef = makeQueryRef("$(text).terms.id<?>", term.id);
          return (
            <TermRow
              key={term.id}
              term={term}
              termRef={termRef}
              index={index}
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              globalFilterUntranslatedTerms={props.globalFilterUntranslatedTerms}
              pinnedTerms={props.pinnedTerms}
              setPinnedTerms={props.setPinnedTerms}
              onRemove={onRemoveTerm}
            />
          );
        })}
    </Container>
  );
};

export default React.memo(TermList);
