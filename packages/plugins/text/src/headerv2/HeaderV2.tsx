import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useTheme } from "@emotion/react";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import PhraseGroup from "../phrasegroups/PhraseGroup";
import PhraseHeader from "./PhraseHeader";
import { SchemaTypes, useHasIndication, useReferencedObject } from "../floro-schema-api";
import TriToggle from "@floro/storybook/stories/design-system/TriToggle";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import PhraseFilter from "./PhraseFilter";
import LocalesSections from "../locales/LocalesSections";

const HeaderContainer = styled.div`
  width: 100%;
  height: 104px;
  position: sticky;
  top: 0;
  z-index: 4;
  border-bottom: 1px inset ${ColorPalette.gray};
  background: ${props=> props.theme.background};
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
  z-index: 3;
  transition: height 100ms;
  background: ${props=> props.theme.background};
  border-bottom: 1px inset ${ColorPalette.gray};
`;

const HeaderSearchContainer = styled.div`
  width: 100%;
  height: 132px;
  position: sticky;
  z-index: 2;
  border-bottom: 1px solid ${ColorPalette.gray};
  background: ${props=> props.theme.background};
  transition: top 100ms;
`;

const Inner = styled.div`
  max-width: 1020px;
`

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
  onShowEditLocales: () => void;
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
  pinnedGroups: Array<string>|null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
  showOnlyPinnedGroups: boolean;
  setShowOnlyPinnedGroups: (filter: boolean) => void;
}

const HeaderV2 = (props: Props) => {

  const locales = useReferencedObject("$(text).localeSettings.locales");
  const localesHasIndication = useHasIndication("$(text).localeSettings.locales");

  useEffect(() => {
    if (localesHasIndication) {
      props.onShowEditLocales();
    }

  }, [localesHasIndication, props.onShowEditLocales])
  const localeOptions = useMemo(() => {
    return [
      ...(locales ?? [])?.filter(v => !!v)
        ?.map((locale) => {
          return {
            label: `${locale.localeCode}`,
            value: locale.localeCode.toUpperCase(),
          };
        }) ?? []
    ];
  }, [locales]);


  //useEffect(() => {
  //  props.setShowFilters(true);

  //}, [])
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
                </span>
              ),
              value: "phrases",
            }}
            midOption={{
              label: (
                <span style={{ position: "relative" }}>
                  {"terms"}
                </span>
              ),
              value: "terms",
            }}
            rightOption={{
              label: (
                <span style={{ position: "relative" }}>
                  {"locales"}
                </span>
              ),
              value: "locales",
            }}
            onChange={function (value: string): void {
              props.setPage(value as "phrases"| "terms" | "locales")
            }}
          />
        </div>
        <div>
          <div style={{marginTop: -12, zIndex: 3}}>
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
        </div>
      </HeaderContainer>
      {props.page != "locales" && (
        <FilterContainer
          style={{
            height: props.showFilters ? 132 : 0,
          }}
        >
          {props.showFilters && (
            <PhraseFilter
              showOnlyPinnedPhrases={props.showOnlyPinnedPhrases}
              selectedTopLevelLocale={props.selectedTopLevelLocale}
              phraseGroups={props.phraseGroups}
              filteredPhraseGroups={props.filteredPhraseGroups}
              filterTag={props.filterTag}
              setFilterTag={props.setFilterTag}
              globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
              globalFilterUntranslated={props.globalFilterUntranslated}
              setGlobalFilterRequiresUpdate={props.setGlobalFilterRequiresUpdate}
              setGlobalFilterUnstranslated={props.setGlobalFilterUnstranslated}
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
          {props.page == "phrases" && (
            <PhraseHeader
              showFilters={props.showFilters}
              setShowFilters={props.setShowFilters}
              isEditGroups={props.isEditGroups}
              searchText={props.searchText ?? ""}
              onSetSearchText={props.onSetSearchText}
              selectedTopLevelLocale={props.selectedTopLevelLocale as string}
              setGlobalFilterUnstranslated={props.setGlobalFilterUnstranslated}
              setGlobalFilterRequiresUpdate={props.setGlobalFilterRequiresUpdate}
              globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
              globalFilterUntranslated={props.globalFilterUntranslated}
              filterTag={props.filterTag}
              showOnlyPinnedPhrases={props.showOnlyPinnedPhrases ?? false}
              setShowOnlyPinnedPhrases={props.setShowOnlyPinnedPhrases}
              pinnedPhrases={props.pinnedPhrases}
              setPinnedPhrases={props.setPinnedPhrases}
              removePinnedPhrases={props.removePinnedPhrases}
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
            />
          )}
        </HeaderSearchContainer>
      )}
    </>
  );
};

export default React.memo(HeaderV2);
