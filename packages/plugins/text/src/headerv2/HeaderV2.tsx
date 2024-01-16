import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import PhraseHeader from "./PhraseHeader";
import {
  SchemaTypes,
  useHasIndication,
  useReferencedObject,
} from "../floro-schema-api";
import TriToggle from "@floro/storybook/stories/design-system/TriToggle";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import PhraseFilter from "./PhraseFilter";
import { useFocusContext } from "../focusview/FocusContext";
import TermHeader from "./TermHeader";
import TermFilter from "./TermFilter";
import { useDiffColor } from "../diff";

const HeaderContainer = styled.div`
  width: 100%;
  height: 104px;
  position: sticky;
  top: 0;
  z-index: 5;
  border-bottom: 1px inset ${ColorPalette.gray};
  background: ${(props) => props.theme.background};
  display: flex;
  padding-left: 24px;
  padding-right: 48px;
  align-items: center;
  justify-content: space-between;
`;

const FilterContainer = styled.div`
  width: 100%;
  position: sticky;
  top: 104px;
  z-index: 4;
  transition: height 100ms;
  background: ${(props) => props.theme.background};
  border-bottom: 1px inset ${ColorPalette.gray};
`;

const HeaderSearchContainer = styled.div`
  width: 100%;
  height: 132px;
  position: sticky;
  z-index: 3;
  border-bottom: 1px solid ${ColorPalette.gray};
  background: ${(props) => props.theme.background};
  transition: top 100ms;
`;

const ChangeDot = styled.div`
  position: absolute;
  right: -12px;
  top: -2px;
  height: 12px;
  width: 12px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

interface Props {
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
  onSetSearchText: (str: string) => void;
  searchText: string;
  searchTextState: string;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  setShowOnlyPinnedPhrases: (filter: boolean) => void;
  removePinnedPhrases: () => void;
  removePinnedGroups: () => void;
  onSetSearchTextState: (str: string) => void;
  setGlobalFilterRequiresUpdate: (filter: boolean) => void;
  setGlobalFilterUnstranslated: (filter: boolean) => void;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  showOnlyPinnedPhrases: boolean;
  selectedTopLevelLocale: string;
  isEditGroups: boolean;
  phraseGroups: SchemaTypes["$(text).phraseGroups"];
  filteredPhraseGroups: SchemaTypes["$(text).phraseGroups"];
  setSelectedTopLevelLocale: (localeCode: string) => void;

  onShowEditGroups: () => void;
  onHideEditGroups: () => void;

  page: "phrases" | "terms" | "locales";
  setPage: (page: "phrases" | "terms" | "locales") => void;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  pinnedPhrasesWithGroups: {
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
    phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  }[];
  selectedGroup: string | null;
  setSelectedGroup: (tag: string | null) => void;
  pinnedGroups: Array<string> | null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
  showOnlyPinnedGroups: boolean;
  setShowOnlyPinnedGroups: (filter: boolean) => void;
  setPhraseGroups: (
    pgs: SchemaTypes["$(text).phraseGroups"],
    doSave?: boolean
  ) => void | (() => void);

  onSetSearchTermText: (str: string) => void;
  searchTermText: string;
  isEditTerms: boolean;
  onShowEditTerms: () => void;
  onHideEditTerms: () => void;
  globalFilterUntranslatedTerms: boolean;
  setGlobalFilterUnstranslatedTerms: (filter: boolean) => void;
  showOnlyPinnedTerms: boolean;
  setShowOnlyPinnedTerms: (filter: boolean) => void;
  pinnedTerms: Array<string> | null;
  setPinnedTerms: (phraseRegs: Array<string>) => void;
  removePinnedTerms: () => void;
  terms: SchemaTypes["$(text).terms"];
  filteredTerms: SchemaTypes["$(text).terms"];
  onSetTerms: (terms: SchemaTypes["$(text).terms"]) => void;
  selectedTerm: string|null;
  setSelectedTerm: (term: string|null) => void;
}

const HeaderV2 = (props: Props) => {
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const prasesHasIndication = useHasIndication(
    "$(text).phraseGroups",
    true
  );
  const phraseDiffColor = useDiffColor("$(text).phraseGroups", true, "darker");
  const termsHasIndication = useHasIndication(
    "$(text).terms",
    true
  );
  const termDiffColor = useDiffColor("$(text).terms", true, "darker");
  const localesHasIndication = useHasIndication(
    "$(text).localeSettings",
    true
  );
  const localeDiffColor = useDiffColor("$(text).localeSettings", true, "darker");

  const { showFocus } = useFocusContext();
  const localeOptions = useMemo(() => {
    return [
      ...((locales ?? [])
        ?.filter((v) => !!v)
        ?.map((locale) => {
          return {
            label: `${locale.localeCode}`,
            value: locale.localeCode.toUpperCase(),
          };
        }) ?? []),
    ];
  }, [locales]);

  return (
    <>
      <HeaderContainer>
        <div style={{ marginRight: 12 }}>
          <TriToggle
            value={props.page}
            leftOption={{
              label: (
                <span style={{ position: "relative" }}>
                  {"phrases"}
                  {prasesHasIndication && (
                    <ChangeDot
                      style={{ background: phraseDiffColor }}
                    />
                  )}
                </span>
              ),
              value: "phrases",
            }}
            midOption={{
              label: (
                <span style={{ position: "relative" }}>
                  {"terms"}
                  {termsHasIndication && (
                    <ChangeDot
                      style={{ background: termDiffColor }}
                    />
                  )}
                </span>
              ),
              value: "terms",
            }}
            rightOption={{
              label: (
                <span style={{ position: "relative" }}>
                  {"locales"}
                  {localesHasIndication && (
                    <ChangeDot
                      style={{ background: localeDiffColor }}
                    />
                  )}
                </span>
              ),
              value: "locales",
            }}
            onChange={function (value: string): void {
              props.setPage(value as "phrases" | "terms" | "locales");
            }}
          />
        </div>
        <div>
          {!showFocus && props.page != "locales" && (
            <div style={{ marginTop: -12, zIndex: 3 }}>
              <InputSelector
                hideLabel
                options={localeOptions}
                value={props.selectedTopLevelLocale ?? null}
                label={"locale"}
                placeholder={"locale"}
                size="shortest"
                onChange={(option) => {
                  props.setSelectedTopLevelLocale(option?.value as string);
                }}
                maxHeight={800}
              />
            </div>
          )}
        </div>
      </HeaderContainer>
      {props.page != "locales" && (
        <FilterContainer
          style={{
            height: props.showFilters ? 132 : 0,
          }}
        >
          {props.showFilters && props.page == "phrases" && (
            <PhraseFilter
              showOnlyPinnedPhrases={props.showOnlyPinnedPhrases}
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              phraseGroups={props.phraseGroups}
              filteredPhraseGroups={props.filteredPhraseGroups}
              filterTag={props.filterTag}
              setFilterTag={props.setFilterTag}
              globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
              globalFilterUntranslated={props.globalFilterUntranslated}
              setGlobalFilterRequiresUpdate={
                props.setGlobalFilterRequiresUpdate
              }
              setGlobalFilterUnstranslated={props.setGlobalFilterUnstranslated}
            />
          )}
          {props.showFilters && props.page == "terms" && (
            <TermFilter
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              globalFilterUntranslatedTerms={props.globalFilterUntranslatedTerms}
              setGlobalFilterUnstranslatedTerms={props.setGlobalFilterUnstranslatedTerms}
            />
          )}
        </FilterContainer>
      )}
      {props.page != "locales" && (
        <HeaderSearchContainer
          style={{
            top: props.showFilters ? 236 : 104,
          }}
        >
          <>
            {props.page == "phrases" && (
              <PhraseHeader
                showFilters={props.showFilters}
                setShowFilters={props.setShowFilters}
                isEditGroups={props.isEditGroups}
                searchText={props.searchText ?? ""}
                onSetSearchText={props.onSetSearchText}
                selectedTopLevelLocale={props.selectedTopLevelLocale as string}
                setGlobalFilterUnstranslated={
                  props.setGlobalFilterUnstranslated
                }
                setGlobalFilterRequiresUpdate={
                  props.setGlobalFilterRequiresUpdate
                }
                globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
                globalFilterUntranslated={props.globalFilterUntranslated}
                filterTag={props.filterTag}
                showOnlyPinnedPhrases={props.showOnlyPinnedPhrases ?? false}
                setShowOnlyPinnedPhrases={props.setShowOnlyPinnedPhrases}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                removePinnedPhrases={props.removePinnedPhrases}
                removePinnedGroups={props.removePinnedGroups}
                searchTextState={props.searchTextState}
                onSetSearchTextState={props.onSetSearchTextState}
                phraseGroups={props.phraseGroups}
                filteredPhraseGroups={props.filteredPhraseGroups}
                onShowEditGroups={props.onShowEditGroups}
                onHideEditGroups={props.onHideEditGroups}
                pinnedPhrasesWithGroups={props.pinnedPhrasesWithGroups}
                selectedGroup={props.selectedGroup}
                setSelectedGroup={props.setSelectedGroup}
                pinnedGroups={props.pinnedGroups}
                setPinnedGroups={props.setPinnedGroups}
                showOnlyPinnedGroups={props.showOnlyPinnedGroups}
                setShowOnlyPinnedGroups={props.setShowOnlyPinnedGroups}
                setPhraseGroups={props.setPhraseGroups}
              />
            )}
            {props.page == "terms" && (
              <TermHeader
                onSetSearchTermText={props.onSetSearchTermText}
                searchTermText={props.searchTermText}
                isEditTerms={props.isEditTerms}
                onShowEditTerms={props.onShowEditTerms}
                onHideEditTerms={props.onHideEditTerms}
                globalFilterUntranslatedTerms={
                  props.globalFilterUntranslatedTerms
                }
                setGlobalFilterUnstranslatedTerms={
                  props.setGlobalFilterUnstranslatedTerms
                }
                showOnlyPinnedTerms={props.showOnlyPinnedTerms ?? false}
                setShowOnlyPinnedTerms={props.setShowOnlyPinnedTerms}
                pinnedTerms={props.pinnedTerms}
                setPinnedTerms={props.setPinnedTerms}
                removePinnedTerms={props.removePinnedTerms}
                selectedTopLevelLocale={props.selectedTopLevelLocale}
                showFilters={props.showFilters}
                setShowFilters={props.setShowFilters}
                terms={props.terms}
                filteredTerms={props.filteredTerms}
                onSetTerms={props.onSetTerms}
                selectedTerm={props.selectedTerm}
                setSelectedTerm={props.setSelectedTerm}
              />
            )}
          </>
        </HeaderSearchContainer>
      )}
    </>
  );
};

export default React.memo(HeaderV2);
